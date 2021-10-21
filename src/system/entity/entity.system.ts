import {SystemDescription, SystemInstance} from "../system";
import {Entity} from "./entity";
import {EntityExtenderBuilder, EntityExtenderInstaller} from "./extenders";
import {EntityBuilder} from "./entity-builder";
import {EngineSubscene} from "../scene/engine-subscene";
import {AddJointNodeExtender} from "../../extenders/impl/add-joint-node.extender";
import {AddSkyboxExtender} from "../../extenders/impl/skybox/add-skybox.extender";
import {AddModelExtender} from "../../extenders/impl/mesh/model.extender";
import {getClassName} from "../../shared/functions/get-class-name";

const extenderInstallers: EntityExtenderInstaller<any>[] = [
    AddJointNodeExtender,
    AddSkyboxExtender,
    AddModelExtender,
];


export interface ExtenderConfig {

    extenders: (
        { extenderInstaller: EntityExtenderInstaller<any> } // | { extenderUrl: URL }
    )[]
}

export interface EntityBuilderSchema {
    entityTypeName: string,
    extenderInstallerInfo: EntityExtenderInstallerSchema<any>[]
}

export interface EntityExtenderInstallerSchema<ExtenderOptionsType extends { config: {} }> {
    extenderTypeName: string,
    extenderConfig: ExtenderOptionsType,
    extenderTag: string,
    extenderImplName: string,
}

export class EntitySystemConfig {
    customExtenderConfig: ExtenderConfig | null = null; //For registering custom installers
}

/**
 * Entities are created from entity builders.
 * Entity builders are created by system.
 * System can create entity builders using already created entity builders or schema.
 * If user uses schema, system looks for
 *
 * Extender builders can be passed directly or loaded using schema. To load builders from schema
 * those builders should be registered before. Otherwise extender builder function raises exception.
 */
export class EntitySystemImpl extends SystemInstance<EntitySystemImpl, EntitySystemConfig> {

    protected extenderInstallerTypes: Record<string, EntityExtenderInstaller<any>> = {};

    /**
     * Scene system should not be aware of Entity system
     * Subscene entities should be contained in Entity system
     */
    protected sceneEntities = new Map<EngineSubscene, Entity[]>();

    protected entityTypes: Record<string, EntityBuilder> = {};

    async initialize() {
        const customExtenderConfig = this.provider.getConfig()?.customExtenderConfig;

        extenderInstallers.forEach(installer => this.registerExtenderType(installer));

        customExtenderConfig?.extenders?.forEach(extenderConfig => this.registerExtenderType(extenderConfig.extenderInstaller))
    }

    /**
     * Method used to create new entity type directly from extender builder objects
     * @param entityTypeName Name to register newly created builder with
     * @param extenderBuilders Extender extenderBuilders to use
     *
     * @description
     * This method is required to:
     * 1) Make entity to be saved and loaded correctly
     * 2) Register created entities of this type in global entity list correctly
     */
    createEntityBuilderUsingExtenders(entityTypeName: string, ...extenderBuilders: EntityExtenderBuilder<any>[]): EntityBuilder {
        if (this.entityTypes[entityTypeName]) {
            throw Error(`Trying to create entity with name [${ entityTypeName }] that already exists`);
        }

        const builder = new EntityBuilder(this, this.registerEntity.bind(this), entityTypeName, ...extenderBuilders);
        this.entityTypes[entityTypeName] = builder;
        return builder;
    }

    /**
     * @description Method used to create new entity type using schema. In this case extenders are
     * determined automatically using registered extender types. <br>
     * Throws error if extender was not found
     */
    createEntityBuilderUsingSchema(schema: EntityBuilderSchema): EntityBuilder {
        const builderWithSameName = this.entityTypes[schema.entityTypeName];

        // If such builder is already created
        if (builderWithSameName) {

            const builderWithSameNameSchema = this.getEntityBuilderSchema(builderWithSameName);
            const sameImplementation = this.compareEntityBuilderSchemas(schema, builderWithSameNameSchema);

            if (!sameImplementation) {
                throw Error(`[${getClassName(this)}]: Trying to create EntityBuilder with name [${schema.entityTypeName}] schema, but it's already created and has different implementation`);
            }

            return builderWithSameName;
        }

        return this.createEntityBuilderUsingExtenders(
            schema.entityTypeName,
            ...schema.extenderInstallerInfo.map(info => {
                return this.extenderInstallerTypes[info.extenderImplName].install(info.extenderTag, info.extenderConfig);
            })
        )
    }

    getEntityData(entity: Entity) {
        return entity.getEntityStateSummary();
    }

    getEntityBuilderSchema(entityBuilder: EntityBuilder): EntityBuilderSchema {
        return {
            entityTypeName: entityBuilder.entityTypeName,
            extenderInstallerInfo: entityBuilder.builders.map(builder => this.getExtenderInstallerSchema(builder))
        }
    }

    compareEntityBuilderSchemas(schema1: EntityBuilderSchema, schema2: EntityBuilderSchema): boolean {
        const sameType = schema1.entityTypeName === schema2.entityTypeName;

        const schema2InstallerRecord = schema2.extenderInstallerInfo.reduce((acc, info) => ({ ...acc, [info.extenderTypeName]: info}), {});
        const allInstallersAreSame = schema1.extenderInstallerInfo.reduce(
            (acc, info1) => {
                const info2 = schema2InstallerRecord[info1.extenderTypeName];

                const isImplemented = info2;
                const isSameImplementation = info1.extenderImplName === info2.extenderImplName;

                return acc && isImplemented && isSameImplementation;
            },
            true
        );

        return allInstallersAreSame;
    }

    getExtenderInstallerSchema<ExtenderOptionsType extends { config: any }>(
        builder: EntityExtenderBuilder<ExtenderOptionsType>
    ): EntityExtenderInstallerSchema<ExtenderOptionsType> {
        return {
            extenderTypeName: builder.extenderTypeName,
            extenderConfig: builder.config,
            extenderTag: builder.extenderTag,
            extenderImplName: builder.extenderImplName,
        }
    }

    getEntitiesList(scene?: EngineSubscene): Entity[] {
        if (!scene) {
            return Object.values(this.sceneEntities).reduce((arr, entityList) => [ ...arr, ...entityList], []);
        }
        return this.sceneEntities.get(scene) ?? [];
    }

    getRegisteredExtenderInstallerTypes(): Readonly<Record<string, EntityExtenderInstaller<any>>> {
        return this.extenderInstallerTypes;
    }

    registerExtenderType(installer: EntityExtenderInstaller<any>) {
        this.extenderInstallerTypes[installer.extenderImplName] = installer;
    }

    extendEntityBuilder(extendedBuilderName: string, entityBuilder: EntityBuilder, ...newExtenderBuilders: EntityExtenderBuilder<any>[]): EntityBuilder {
        return this.createEntityBuilderUsingExtenders(extendedBuilderName, ...entityBuilder.builders, ...newExtenderBuilders);
    }

    protected registerEntity(entity: Entity) {
        this.sceneEntities.set(
            entity.scene,
            [
                ...(this.sceneEntities.get(entity.scene) ?? []),
                entity
            ]
        );
    }
}

export const EntitySystem = new SystemDescription(
    EntitySystemConfig,
    EntitySystemImpl,
    []
);
