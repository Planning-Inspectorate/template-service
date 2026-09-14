export const eventViewFieldToDatabaseField = new Map([
	['EventDescription', 'description'],
	['EventDate', 'eventDate'],
	['Publicised', 'Publicised'],
	['Owner', 'owner'],
	['Reason', 'reason']
]);

export const eventDatabaseFieldToViewField = new Map(
	Array.from(eventViewFieldToDatabaseField, (entry) => [entry[1], entry[0]])
);
