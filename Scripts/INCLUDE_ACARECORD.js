/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDE_ACARECORD.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 18/01/2017 13:18:12
|
/------------------------------------------------------------------------------------------------------*/
eval(getScriptText("INCLUDE_RECORD"));
function ACARecord(capModel) {
	this.capModel = capModel;
	Record.call(this, capModel.getCapID());
};
ACARecord.prototype = Object.create(Record.prototype);
ACARecord.prototype.constructor = ACARecord;

ACARecord.prototype.getCap = function() {
	return this.capModel;

}
ACARecord.prototype.getASI = function(asiGroup, name, defaultValue) {
	if (typeof defaultValue === "undefined") {
		defaultValue = "";
	}
	var asiGroups = this.getCap().getAppSpecificInfoGroups();
	var iteGroups = asiGroups.iterator();
	var val = null;
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (name == field.getCheckboxDesc()) {
					val = field.getChecklistComment();
				}
			}
		}
	}

	if (val == null || val + "" == "") {
		val = defaultValue;
	}

	return val
}
ACARecord.prototype.editASI = function(group, name, value) {

	var asiGroups = this.getCap().getAppSpecificInfoGroups();

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (name == field.getCheckboxDesc()) {

					field.setChecklistComment(value);
					group.setFields(fields);
				}
			}
		}
	}

}

ACARecord.prototype.getAllASI = function(groupBySubgroup) {
	var asi = {};
	//
	var asiGroups = this.getCap().getAppSpecificInfoGroups();

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();

				var value = field.getChecklistComment();
				if (value == null || value + "" == "") {
					value = "";
				}
				var asiLabel = field.getCheckboxDesc();
				if (groupBySubgroup) {
					var subGroupName = field.getCheckboxType()
					if (!asi.hasOwnProperty(subGroupName)) {
						asi[subGroupName] = {};
					}
					asi[subGroupName][asiLabel] = value
				} else {
					asi[asiLabel] = value;
				}

			}
		}
	}

	return asi;
}