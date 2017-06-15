print('Renaming filename in stash collection');

db.getSiblingDB('admin').adminCommand({listDatabases:1}).databases.forEach(function(database){
	var myDb = db.getSiblingDB(database.name);
	myDb.getCollectionNames().forEach(function(collection){

		if((/^\w+\.stash\.\w+\.files$/).test(collection)){
			var myCollection = myDb[collection];
			print('processing ' + database.name + ' ' + collection + '....');
			myCollection.find().forEach(function(item){
				if(item.filename){
					var urls = item.filename.split('/');
					if(urls[1] !== 'teamspaces' && urls[3] !== 'models'){
						urls.splice(1,0,'teamspaces');
						urls.splice(3,0,'models');
						myCollection.update({ _id : item._id }, { '$set': { filename: urls.join('/')} });
					}
				}
			});

		}

		
	});
});

print('Done');
