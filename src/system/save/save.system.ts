import {SystemDescription, SystemInstance} from "../system";
import {EngineSubscene} from "../scene/engine-subscene";
import {
    EntityBuilderSchema,
    EntityExtenderInstallerSchema,
    EntitySystem,
    EntitySystemImpl
} from "../entity/entity.system";
import {EntityBuilder} from "../entity/entity-builder";
import {getClassName} from "../../shared/functions/get-class-name";

export interface SaveInfo {
    saveName: string,
    savedSceneName: string,
}

export interface SaveData {
    saveName: string,
    sceneDump: SceneDataDump,
}

export interface SceneDataDump {
    entityTypes: Record<string, EntityBuilderSchema>,
    entitiesData: Record<string, {
        entityTypeName: string,
        state: Record<string, any>,
    }>
}

export interface SaveAdapter {
    getSaveInfoList(): SaveInfo[];
    createSave(info: SaveInfo, data: SceneDataDump): Promise<void>;
    getSaveInfoByName(saveName: string): SaveInfo | undefined;
    getSaveDataByName(saveName: string): SceneDataDump | undefined;
}

export class SaveSystemConfig {
    // adapter?: SaveAdapter = undefined;
}

/**
 * Load lifecycle:
 * 1) Start engine
 * 2) Create empty Babylon scene (Engine system)
 * 3) Register all needed extenders. They are provided as urls with extender names (Entity system)
 * 4) Entities are loaded by entity system from config
 * 5) Game can load saves or create scene
 *
 * Entities should have serializable config that tells what extenders are needed for this entity and other parameters
 *
 * If extender is needed for entity but not found, application should raise and exception when creating subscene or adding entity to it
 *
 * Entities should be instantiated through subscene methods. This allows to check if entity can be created before it's usage.
 * User can add more entities to already created subscene.
 * Then, to load saved game you need to create new subscene with saved entity configs, and if successful - load subscene data
 *
 * Save system should save:
 * - entities with their names and types
 * - save entity schemas (extenders with their arguments (those are the same for all entities))
 * - extender instance arguments and state
 *
 * How system loads scene:
 * - Create new virtual scene
 * - Construct entities with saved schemas and extender data
 * - Extenders should check initial data and set up scene from here
 *
 * Problems:
 * While writing extenders user will need to keep in mind serialization
 * It possible to restrict state by number | string | boolean | ISerializable, but it does not solve problem globally
 */
export class SaveSystemImpl extends SystemInstance<SaveSystemImpl, SaveSystemConfig> {

    entitySystem!: EntitySystemImpl;

    protected async initialize() {
        this.entitySystem = await this.provider.getSystem(EntitySystem);
    }


    async saveScene(saveName: string, scene: EngineSubscene, forceOverwrite: boolean = false) {

        const save = {
            saveName: saveName,
            sceneDump: this.createSceneDump(scene),
        };

        console.log(save);

        return Promise.resolve(save);


        // return this.provider.getInjectConfig().adapter.createSave(
        //     {
        //         saveName: saveName,
        //         savedSceneName: scene.sceneName,
        //     },
        //     this.createSaveData(scene)
        // );
    }

    async loadSaveIntoScene(scene: EngineSubscene, save: SaveData): Promise<EngineSubscene> {

        // Save validation
        const neededExtenders = Object.values(save.sceneDump.entityTypes).reduce(
            (neededExtenders: Record<string, EntityExtenderInstallerSchema<any>>, type) => {
                return type.extenderInstallerInfo.reduce(
                    (neededExtenders: Record<string, EntityExtenderInstallerSchema<any>>, info) => {
                        if (!neededExtenders[info.extenderImplName]) {
                            neededExtenders[info.extenderImplName] = info;
                        }
                        return neededExtenders;
                    },
                    neededExtenders
                )
            },
            {}
        );

        const missingExtenders = Object.values(neededExtenders).filter(
            type => this.entitySystem.getRegisteredExtenderInstallerTypes()[type.extenderImplName] === undefined
        );

        if (missingExtenders.length > 0) {
            console.log(missingExtenders.map(type => type.extenderImplName));
            throw Error(`[${getClassName(this)}]: Scene load error - [${
                missingExtenders.map(type => type.extenderImplName).join(', ')
            }] extender implementations are not registered`);
        }

        // Creating entity builders
        const entityBuilders = Object.values(save.sceneDump.entityTypes).reduce((acc, type) => {
            return { ...acc, [type.entityTypeName]: this.entitySystem.createEntityBuilderUsingSchema(type) }
        }, {} as Record<string, EntityBuilder>);

        console.log(Object.entries(save.sceneDump.entitiesData))

        // Creating entity instances
        const entities = Object.entries(save.sceneDump.entitiesData).map(([entityTag, entityData]) => {
            const builder = entityBuilders[entityData.entityTypeName];

            if (!builder) {
                throw Error(`[${getClassName(this)}]: Trying to create Entity of type [${entityData.entityTypeName}], but this entity type was not described in save`);
            }

            return builder.build(scene, entityTag, { initialEntityState: entityData.state })
        });

        return scene;
    }

    protected createSceneDump(scene: EngineSubscene): SceneDataDump {

        //Creating map of entity types
        const typeMap = new Map<string, EntityBuilder>();

        const entities = this.entitySystem.getEntitiesList(scene);
        entities.forEach(entity => {
            if (!typeMap.has(entity.builder.entityTypeName)) {
                typeMap.set(entity.builder.entityTypeName, entity.builder);
            }
        });

        //Forming save structure
        return {
            entityTypes: [ ...typeMap.values() ].reduce(
                (acc, type) => ({ ...acc, [type.entityTypeName]: this.entitySystem.getEntityBuilderSchema(type) }),
                {}
            ),
            entitiesData: entities.reduce(
                (acc, entity) => {
                    return {
                        ...acc,
                        [entity.instanceTag]: {
                            entityTypeName: entity.builder.entityTypeName,
                            state: entity.getEntityStateSummary()
                        }
                    }
                },
                {}
            )
        };
    }

}

export const SaveSystem = new SystemDescription(
    SaveSystemConfig,
    SaveSystemImpl,
    [
        EntitySystem
    ]
);