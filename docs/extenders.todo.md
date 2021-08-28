-- DONE --  
- Extender to change entity position  

- Add ExtenderReceiverEvent to get data with events  

- Wrap ExtenderReceiverEvent with provider  

- Events to send data and to receive data  
 
- Infer extender name from class name  

- Extender dependency check (requires('method name') | provides('method name'))  

-- DEPRECATED --  
- Isolate extender initialization to avoid null state  

- Add init() function to initialize extender state  

- Replace class events with objects to avoid explicit Type ({ type: string, new: function() })  



-- TODO --  
- Extender should be built only di provided all required arguments  

- Add ways to identify Entity, Extender type and ExtenderBuilder instance  

- Extender to add nested entities  



-- IDEAS --  
- Extenders should access systems through DI   

- Automatic state serialization? (getState() extender method, provide initState argument in constructor). 
Extender users can subscribe to updates  

- Type injector using dependency config.  

- Group events with interfaces (Use Record<EventType, EventConstructor>, new EventInterface(), new EventInterfaceImplementation(interface))  

- Consistent events order(?)  

- Make injectors to use observables under the hood  

- Extender count on entity (unique, n, many)  
