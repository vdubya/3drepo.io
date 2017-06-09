print('Move <db>.project.models to <db>.settings.<model>.project');

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	db.getSiblingDB(database.name).projects.find().forEach(function(project){
		if(project.models){
			project.models.forEach(function(model){
				print('processing ' + database.name + '.projects.' + project.name + ' : model ' + model );
				db.getSiblingDB(database.name).settings.update({ _id : model}, { '$set': { project: project.name} });
			});
		}
	});
});

print('Done');