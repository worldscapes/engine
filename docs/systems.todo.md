-- DONE --
- Infer system type from getSystem(config)  

- Engine creates provider to avoid exporting, so System is available only through engine  

- Lifecycle
  1) User provides argument
  2) Bootstrap collects systems that can be initialized
  3) If any, bootstrap initializes them and returns to step 2
  4) Bootstrap calls subscribers for any new systems
  
- Systems call each other creating mess  
  Solution: SystemDescription class to declare dependencies and SystemProvider to inject them
  
- Systems need to check state arguments to be defined explicitly  
  Solution: move arguments check outside of system and provide them once defined
  
- Hard to determine system dependencies  
  Solution: SystemDescription class to declare dependencies

- Hard to determine systems initialization order  
  Solution: do not define strict order, systems should initialize when required systems initialize

- System initialize as soon as:
  + User provided all needed arguments (config)
  + Other needed systems did initialize
  + System.request() called by some code

- Users can subscribe and wait until system(s) initialized

- Systems declare all needed arguments for them in special method

-- TODO --
- Remove system description, replace required field with getRequiredSystems() instance method  

- Add LoggingSystem (print to console, screen; logging levels)  

- Add ErrorSystem (catch engine errors and log / print them)

- Add SceneSystem (scene creation, creation of nodes in current scene)


-- PROBLEMS --

  
-- IDEAS --  
- ThisType<this>

- System dependencies determination using state

- Split input aliases and custom configurations  
Aliases area inserted into system in runtime, but they can be overridden by config 
  
- Input filters should not receive input state from InputSystem

-- FORBIDDEN --  
- Use entity's dependency injection for systems