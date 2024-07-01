Dieser Unterordner entählt eine Client-Server Anwendung unter Verwendung von Express und PUG.
Die Anwendung besteht aus 4 Seiten.
Die Seiten /, /map und /chart verwenden jeweils eine eigene Javascript Datei im ordner public.
Die Datei getWeather.js wird ebenfalls von den Seiten /map und /chart verwedendet. Sie enthält die funktion um die aktuelle Temperatur abzufragen.
Die Temperatur wird im Chart und in den Popups der Map verwendet. Sie wird bim Aufrufen der jeweiligen Seite abgefragt.
Die restlichen Daten werden aus der Mongo-Datenbank abgerufen.
Auf der Home-Seite (/) kann eine Json-Datei hochgeladen werden. Dabei wird überprüft ob es sich um das richtige Dateiformat handelt.

Die Anwendung kann über npm start ausgeführt werden.
Sie läuft über den Port 3000
