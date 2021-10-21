Worldscapes Engine is data-driven framework that serves as abstraction layer over Babylon.js.

> Before we start, it's important for each section to cover:
>    <ol>
>        <li> What subject is?
>        <li> Why is it needed?
>        <li> What does it use to achieve it's goal?
>    </ol>

---

##Engine Goals

- Provide architecture for game development as complete solution,
  since Babylon.js only provides functionalities, not architecture
- Abstract Babylon.JS API and wrap it with more convenient and 
  logical one where it's needed
- Extend Babylon.JS with features that are missing and provide 
  more organized and usable solutions in different domains
  
---

##Expected Features

- Separate presentational and logic layer
- Separate data and behaviour
    - Game world persistence from a box
- Uni-directional data-flow  
- Clear separation of different aspects of game
    - Network
    - Graphics 
      - Animation
      - Modeling
      - Rendering
      - Texturing
      - Effects
    - GIU
    - Sound
    - AI 
    - Physics
    - Input
- Composable entities
- Both client-side and server-side support
- Game entities can be tested independently
- Lazy loading game resources and entity implementations

---

##Concept

Game world consists of entities (they serve as prefabs). User builds entities by composing blocks.
Entity state and its game presentation are separate. Entities do not directly call anything outside, so they 
can be independently tested in isolation. 

Engine needs resources for presentation only, so it can run while
resources still load meanwhile. 

Engine provides access to Babylon.js features using Systems. Systems are namespaces that group functionality 
related to different aspects of game and abstract Babylon.js API in their own methods.
User can implement their own systems depending on project needs. 

---

##Layers

Layers are abstraction levels of engine.

Engine needs layers to separate concerns and organize game data flow.

Engine separates concerns by isolating them on different layers. Inside layers concerns also need extra 
organization, because often they are interrelated and can mix up.

Engine organizes data flow by making it unidirectional and flowing from higher layers to lower ones.
Data flow drives game world changes over time.

**Engine layers list** going from higher to lower level:

- Event layer
- World layer
- Networking layer
- Presentation layer
    - Framing sublayer
    - Preprocessing sublayer
    - Display sublayer

Every frame engine updates world by processing events accumulated last frame. Processing starts from the highest layer
and goes to bottom.

Layers are not aware of each other, they are organized and interconnected by engine itself. It's needed to 
improve engine extensibility and make it easier to work with layers. Basically, layers take input and produce output.


###Data flow

Engine regulates data flow, so it flows in one direction:

- Events come and stay stacked in Event layer
- Engine processes input and events, changing state of game entities
- Engine uses entity state to update presentational layer

---

##Event layer

Event layer is entry point for all world updates.

It's needed to provide general way to update game state. Also, it makes it possible for other layers to communicate with
each other.

~~It receives events from other layers and distributes them to lower layers~~. Lower layers use events to do
updates game state.

Event layers processes events generally no matter which source they come from. The source can be Presentational layer
(user input) or World layer. Engine transforms input coming from Presentational layer into events, World layer can
dispatch data that is transformed into events as well.

Some events can impact Presentational layer itself (e.g., camera movement), and they can be not needed on server.
Because of that, Event layer might need to work with Presentational layer and World layer separately.

---

##World layer

World layer contains game world state as single data structure. Its responsibility is to process and update it
according to events that come from Event layer. 

After World layer processed all events, world state snapshot goes to Presentational layer.

Except event processing, World layer can have recurring tasks to update world state with time. Those tasks can 
run and stop depending on world state.

This layer can be local for single-player games and remote for multiplayer.

World layer passes only updates to presentation layer, so it compares new state value after applying all changes
with old state.


###Domains:

- Scene entities organization

World layer organized game entities by Entity-Component-System pattern  

- Running NullEngine

NullEngine is used to run physics, detect collisions on server-side

? It might not be needed only for physics because physics can be used directly from Cannon.js

- World persistence

ECS makes it easy to maintain world persistence.

- Server-side aspects
    - AI
    - Physics
    - User Input reactions


###Architecture

World layer keeps world state in a single object.
Object consists of Entities, each entity is a set of Components handled by Systems.

Systems perform changes of world state. They are pure functions, that take world state and any 
needed extra data, and returns list of updated components. Those functions can be closured
by container functions to provide additional data or perform side effects.
    

####Example:

    // Container function is impure and can 
    function bulidDamageSystem() {
    
        // Creating local cache
        let cache = {};

        // Create systemImplementationFunction that will be used by WorldLayer
        return (requestedCompoents, relatedEvents) => {
            const result = damageSystemImpl(
                { cache }, 
                requestedCompoents, 
                relatedEvents
            );
            
            // Updating cache if changed
            if (updatedAdditionalArguments?.cache) {
                cache = updatedAdditionalArguments.cache;
            }

            return result.updatedComponents;
        }
    }

    // Implementation function is pure and only depends on it's arguments
    function damageSystemImpl(
        
        // System implementation can have additional arguments or settings
        additionalArguments: {
            cache: any
        }

        // Components are provided by World layer depending on what components are listed in system dependency list
        requestedComponents: { 
            health: Component[],
            weapon: Component[] 
        },

        // Events are provided by World layer depending on what event types system subscribed to
        relatedEvents: Event[] 
    ) {

        const attackEvents = relatedEvents.filter(event => event.type === ATTACK_EVENT_TYPE);

        // Handle all attack events
        ...

        return {
            updatedComponents,
            updatedAddutionalArguments
        }
    }

---

##Networking layer

Networking layer is separate layer to transfer data between server-side and client-side.
It's not aware of data it transfers, but it can be listened to by user and customized. Also, it doesn't know
about other layers, Engine handles their communication.
Networking layer transfers data using abstract protocol, so it can be done using Websockets or transferred 
locally in single-player games.

###Domains:

- Providing customizable layer to transfer data between server-side and client-side

---

##Presentation layer

Presentation layer is layer responsible for presenting data to user. It consists of three parts - Framing logic, Preprocessing logic
and Display logic. Those are grouped because they both should exist for every presentational context.

By presentational context we mean:
- Behaviour that framed world state on server side before passing it to client
- Framed world state that is passed to client-side
- Behaviour that manages exclusive client-side entities (e.g., cameras, sounds)
- Logic that displays resulting world state to user on client-side

In multiplayer, each player has their own presentational context. Also, it's possible to have many presentational contexts at once
in single player, to have different data sets for them, or to render them in several places.

Because of that, by **game instance** we mean input and world layers with all presentational contexts that exist inside of game.

_Presentational layer as World layer implements ECS to work with state. Because of that, ECS should be implemented abstractly
no matter in which layer it works._

##Framing sublayer

Since in multiplayer users can see different parts of the world as well as have their own view on it, we need to frame (aka filter)
world state before passing it to client. This is where framing logic comes into play.

Engine uses framing logic on server-side. It passes world state with client-related information to framing logic, so it
can remove all private, restricted or excessive information before it goes to client-side.


##Preprocessing sublayer

Preprocessing logic locates on client-side and is working with state before it goes to display. It takes framed world state, 
might process it and also add exclusive client-size entities to it.

Also, some entities exist only client-side (for example, main menu). So, their logic stays in preprocessing 
layer.



###Domains:

- Audio
- Cameras
- User Interface
- Resource management
- Customizable inputs


##Display sublayer

Display logic is client-side logic that take resulting world state from preprocessing layer and presents it to user.

---

##Aspects shared between layers

Some aspects go throughout the application, so they are implemented in between or in many layers.

- Networking
- Error handling

---

##Example Game Entities

- Boar NPC
- Tree
- Player
- Skybox
- Smoke Effect
- Terrain
- Character Weapon
- Auction UI
- Bell Ringing on Square
- Staff Projectile
- Other player character
- Minimap
- Iron vein
- Hex map
- Game chat