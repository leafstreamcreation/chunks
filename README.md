Chunks client frontend

A Vue SPA with a service worker

The service worker manages a local forage data cache and handles encrypted communication with the backend, enabling the app to work offline and securely persist user data when a connection is available

The db structure contains the following:
"latestId": number - the last used id; incremented whenever a new activity is created to ensure an activity always has a unique id
"ids": object - the registry of activities in the database
Activity "N": object - one of N activities in the database. Schema:
    id          - number: activity id
    name        - string: the activity's display name
    group       - number: the id of the group the activity belongs to
    historySize - number: the number of time intervals recorded doing the activity
History "N-X": object - one of X time intervals recorded for activity N. Schema:
    startDate   - number: the start date in milliseconds
    endDate     - number: the end date in milliseconds

Service Worker API:
/create                 creates an activity; takes a name and a group id, returns 200 and the activity:
    id: number (latest id) 
    name: string 
    group: number 
    history: [{}]
or 400 if the name or group id is missing.

/{activity}/update      updates an activity; takes a name, a start date or an end date. returns 200 and the updated activity with history populated:
/index                  lists all activities in group index order with history populated.
/{activity}/delete      deletes an activity