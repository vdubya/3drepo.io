print('Renaming account to teamspace in system.users.customData.models array');

var userCol = db.getSiblingDB('admin').system.users;

userCol.find({ 'customData.models.0' : { '$exists': 1}}).forEach(function(user){

	print('Updating user: ' + user._id);

	user.customData.models.forEach(function(model, i){

		var updateObj = {$unset: {}, $set: {}};

		updateObj['$unset']['customData.models.' + i + '.account'] = ""; 
		updateObj['$set']['customData.models.' + i + '.teamspace'] = model.account;
		
		userCol.update({ _id: user._id }, updateObj);
	});
});