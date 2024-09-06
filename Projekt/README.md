Ordner für die Abgabe des Projekts

Auf der Home-Seite können neue Orte hochgeladen werden. In folgenden Fällen wir eine Fehlermeldung angezeigt:
- Formular: Angaben unvollständig(Name & Koordinaten), Ort nicht in Sachsen
- Textfeld: leeres Feld, invalides Json-Format, mindestens ein Ort nicht in Sachsen
- File-upload: falscher Dateityp (.json und .geojson erlaubt, leere Datei, invalides Json-Format, mindestens ein Ort nicht in Sachsen
In diesen Fällen kann der Submit-Button nicht ausgelöst werden.

Auf der Map-Seite werden alle Orte aus der Datenbank gelesen und als Marker auf der Karte angezeigt.
Wird ein Marker ausgewählt, wird für den jeweiligen Ort ein Liniendiagramm mit einer Wettervorhersage erstellt (Intervall 3h für die nächsten 5 Tage)
- tatsächliche Temperatur
- gefühlte Temperatur
Die Daten für die Vorhersage stammen aus der OpenWeather-API: https://openweathermap.org/forecast5

Die Impressum-Seite enthält ein Impressum.
