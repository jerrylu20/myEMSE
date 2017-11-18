/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDE_ACABASE.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 07/02/2016 11:26:47
|
/------------------------------------------------------------------------------------------------------*/
/*-USER-----------DATE----------------COMMENTS----------------------------------------------------------/
 | SALIM           25/05/2016 15:28:46   Adding new methods [setCapModel,setLicenseProfessional]
 /-----END CHANGE LOG-----------------------------------------------------------------------------------*/

SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
var globalEval = eval;

/**
 * constructor for the base page
 */
function ACABASE() {
	this.bshowMessage = true;
	this.bshowDebug = true;
	this.bcancel = false;
	this.tdebug = "";
	this.tmessage = "";
	this.asiGroups = null;
	this.asitGroups = null;
	this.capModel = null;
}

/**
 * cancel the event and set the message
 * 
 * @param message
 *            the message to set
 */
ACABASE.prototype.cancel = function(message) {
	this.bcancel = true;
	this.tmessage = message;
}
/**
 * show debug log
 */
ACABASE.prototype.showDebug = function() {
	this.bshowDebug = true;
}

/**
 * show message
 * 
 * @param message
 *            the message to show
 */
ACABASE.prototype.showMessage = function(message) {
	this.bshowMessage = true;
	this.tmessage = message;
}
/**
 * this is the main function for the execution, it should be defined in the page
 * flow script
 */
ACABASE.prototype.execute = function() {
	throw "Execute not implemented in base page"
}
/**
 * 
 * @returns the CapModel environment variable
 */
ACABASE.prototype.getCapModel = function() {
	if (this.capModel == null) {
		this.capModel = aa.env.getValue("CapModel");
	}
	return this.capModel;
}
/**
 * @param CapModel :
 *            the updated capModel sets the environment CapModel
 */
ACABASE.prototype.setCapModel = function(capModel) {
	if (capModel == null) {
		aa.env.setValue("CapModel", this.getCapModel());
	} else {
		aa.env.setValue("CapModel", capModel);
	}
}
/**
 * 
 * @returns gets the ASI field value
 */
ACABASE.prototype.getAppSpecific = function(itemName) {
	return this.getFieldValue(itemName);
}
/**
 * 
 * @returns sets the ASI field value
 */
ACABASE.prototype.editAppSpecific = function(fieldName, value) {
	var thisCapModel = aa.env.getValue("CapModel");
	var asiGroupsRet = this.setFieldValue(fieldName, value);
	thisCapModel.setAppSpecificInfoGroups(asiGroupsRet);
	aa.env.setValue("CapModel", thisCapModel);
}
/**
 * 
 * @param lp:
 *            license Professional
 * @result : license Professional attached to the CapModel
 */
ACABASE.prototype.setLicenseProfessional = function(lp) {
	var thisCapModel = this.getCapModel();
	thisCapModel.setLicenseProfessionalModel(lp);
	this.setCapModel(thisCapModel);
}

/**
 * 
 * @returns gets the ASI field value from App Specific Info Groups
 */
ACABASE.prototype.getFieldValue = function(fieldName) {

	var asiGroups = this.getAsiGroups();
	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					return field.getChecklistComment();
				}
			}
		}
	}
	return null;
}

/**
 * 
 * @returns the ASI groups of the CapModel of this page flow
 */
ACABASE.prototype.getAsiGroups = function() {
	if (this.asiGroups == null) {
		this.asiGroups = this.getCapModel().getAppSpecificInfoGroups();
	}
	return this.asiGroups;
}
/**
 * 
 * @returns the ASIT groups of the CapModel of this page flow
 */
ACABASE.prototype.getAsitGroups = function() {
	if (this.asitGroups == null) {
		this.asitGroups = this.getCapModel().getAppSpecificTableGroupModel();
	}
	return this.asitGroups;
}
/**
 * set ASI field value
 * 
 * @param fieldName
 *            the asi field name
 * @param value
 *            the value to set
 */
ACABASE.prototype.setFieldValue = function(fieldName, value) {

	var asiGroups = this.getAsiGroups();

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {

					field.setChecklistComment(value);
					group.setFields(fields);
				}
			}
		}
	}
	this.asiGroups = asiGroups;
	return asiGroups;
}

/**
 * set ASI drop down field values ( this one is useful in case you have a
 * dynamic dropdown list);
 * 
 * @param fieldName
 *            the drop down field name
 * @param objValues
 *            the object of values. ex: var obj={}. obj["key"]="value";
 */
ACABASE.prototype.setDropdownValues = function(fieldName, objValues) {

	var value = aa.util.newArrayList();
	for ( var val in objValues) {
		var model = aa.proxyInvoker.newInstance(
				"com.accela.aa.aamain.cap.RefAppSpecInfoDropDownModel")
				.getOutput();
		model.setAttrValue(objValues[val]);
		model.setResAttrValue(objValues[val]);
		model.setFieldLabel(fieldName);
		value.add(model);
	}

	var asiGroups = this.getAsiGroups();

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					field.setValueList(value);
					group.setFields(fields);
				}
			}
		}
	}
	this.asiGroups = asiGroups;

}
/**
 * Gets the ASI Tables on the record in a hashmap with the table name as the key
 * and the table value array as the value
 */
ACABASE.prototype.getASITables = function() {

	var tableMap = aa.util.newHashMap();
	var gm = this.getAsitGroups();

	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();

		if (tsm.rowIndex.isEmpty())
			continue;
		var tempObject = new Array;
		var tempArray = new Array;
		var tn = tsm.getTableName();

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		var numrows = 1;
		while (tsmfldi.hasNext()) {
			if (!tsmcoli.hasNext()) {
				var tsmcoli = tsm.getColumns().iterator();
				tempArray.push(tempObject);
				var tempObject = new Array;
				numrows++
			}
			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();
			tempObject[tcol.getColumnName()] = tval
		}
		tempArray.push(tempObject);
		tableMap.put(tn, tempArray);
	}

	return tableMap;
}
/**
 * internal function to be executed after the execution
 */
ACABASE.prototype.afterExecute = function() {
	var capModel = this.getCapModel();
	capModel.setAppSpecificInfoGroups(this.getAsiGroups());
	aa.env.setValue("CapModel", capModel);

	if (this.tdebug.indexOf("**ERROR") > 0) {
		aa.env.setValue("ErrorCode", "1");
		aa.env.setValue("ErrorMessage", this.tdebug);
	} else {
		if (this.cancel) {
			aa.env.setValue("ErrorCode", "-2");
			if (this.bshowMessage)
				aa.env.setValue("ErrorMessage", this.tmessage);
			if (this.bshowDebug)
				aa.env.setValue("ErrorMessage", this.tdebug);
		} else {
			aa.env.setValue("ErrorCode", "0");
			if (this.bshowMessage)
				aa.env.setValue("ErrorMessage", this.tmessage);
			if (this.bshowDebug)
				aa.env.setValue("ErrorMessage", this.tdebug);
		}
	}
}

/**
 * internal function, should be called after the implementation in the page flow
 * script
 */
function run() {
	try {
		var pfs = new ACABASE();
		pfs.execute();
		pfs.afterExecute();

	} catch (e) {
		aa.env.setValue("ErrorCode", "1");
		aa.env.setValue("ErrorMessage", e + "");
	}
}

/*-------------------------------------------SPECIFIC CODE----------------------------------------------*/

/**
 * this function creates the Associated forms records
 * 
 * @param parentRecordID
 *            the cap ID of the parent record
 * @param childRecordType
 *            the record type of which the child records should be created
 * @param asitGroup
 *            the name of the ASIT group in the parent record which will be used
 *            to create the child Associated forms
 * @param asiGroup
 *            the name of the ASI group that should be updated in the child
 *            records
 * @param asiFields
 *            the ASI group Fields.
 */
ACABASE.prototype.createAssociatedFormsRecords = function(parentRecordID,
		childRecordType, asitGroup, asiGroup, asiFields) {
	var relationshipBizDomain = aa.bizDomain.getBizDomainByValue("ACA_CONFIGS",
			"ASSOCIATED_FORMS_ASIT_RELATIONSHIP_FIELD").getOutput();
	if (relationshipBizDomain == null
			|| relationshipBizDomain.getDescription() == null
			|| relationshipBizDomain.getDescription().length() <= 0) {
		return;
	}

	if (!parentRecordID) {
		var recordID1 = aa.env.getValue("PermitId1");
		var recordID2 = aa.env.getValue("PermitId2");
		var recordID3 = aa.env.getValue("PermitId3");

		if (recordID1 == null || recordID2 == null && recordID3 == null) {
			return;
		}
		parentRecordID = aa.cap.createCapIDScriptModel(recordID1, recordID2,
				recordID3).getCapID();
	}

	logDebug2("parentRecordID", parentRecordID);

	if (parentRecordID == null) {
		return;
	}

	// This value is the ASITable column name which indicates Associated Forms's
	// Record Type.
	var columnNameRecordType = "Record Type";

	// Key of AssociatedForms.
	var associatedFormsFlag = "AssoForm";

	var capScriptModels = aa.cap.getProjectByChildCapID(parentRecordID,
			associatedFormsFlag, null).getOutput();
	logDebug2("capScriptModels", capScriptModels);

	if (capScriptModels != null && capScriptModels.length > 0) {
		// Child Record can not create its child Records.
		logDebug2("Child Record can not create its child Records.", "");
		return;
	}
	var ParentcapID = aa.env.getValue("ParentCapID");
	var asitgroupModel = aa.env.getValue("AppSpecificTableGroupModel");

	if (asitgroupModel != null && asitgroupModel != "") {
		var availableRecordTypeList = null;
		var asitableMap = asitgroupModel.getTablesMap();
		if (asitableMap != null && asitableMap.size() > 0) {
			var availableRecordTypesMap = this.getAllRecordTypes();
			var existingChildRecordsMap = this.getExistingChildsMap(
					parentRecordID, associatedFormsFlag);
			var recordTypeArray = aa.util.newArrayList();
			var recordType = availableRecordTypesMap.get(childRecordType);
			var recordTypes = aa.util.newArrayList();
			var rowIndexValues = aa.util.newArrayList();
			var valueIterator = asitableMap.values().iterator();
			while (valueIterator.hasNext()) {
				var tsm = valueIterator.next();
				if (tsm.getTableName() == asitGroup) {
					var ASITLength = tsm.getTableFields().size()
							/ tsm.getColumns().size();
					if (tsm == null || ASITLength == null
							|| tsm.getColumns() == null) {
						continue;
					}
					for (var i = 0; i < ASITLength; i++) {
						recordTypes.add(recordType);
						rowIndexValues.add(i);
					}

					recordTypeArray.add(recordTypes);
					recordTypeArray.add(rowIndexValues);
					var recordIDList = this.batchCreateRecordsWithAPO(
							recordTypeArray.get(0), parentRecordID);
					var asitArray = this.asitToArray(tsm);
					for (var i = 0; i < asitArray.length; i++) {
						for (var col = 0; col < asiFields.length; col++) {
							var fld = asiFields[col];
							var fldVal = asitArray[i][fld];
							logDebug2("Before ASIT Edit ", asiGroup + " - "
									+ fld + " - " + fldVal);
							aa.appSpecificInfo.editSingleAppSpecific(
									recordIDList.get(i), fld, fldVal, asiGroup);
							logDebug2("ASIT Coppied ", fld + " - " + fldVal);
						}
					}
				}
			}
		}
	}
}

/**
 * Get all Record Type from Database.
 */
ACABASE.prototype.getAllRecordTypes = function() {
	var allRecordTypeMap = aa.util.newHashMap();
	var allRecordTypes = aa.cap.getCapTypeList(null).getOutput();
	if (allRecordTypes != null && allRecordTypes.length > 0) {
		for (var i = 0; i < allRecordTypes.length; i++) {
			var recordType = allRecordTypes[i].getCapType();
			var alias = recordType.getAlias();
			allRecordTypeMap.put(alias, recordType);
		}
	}
	return allRecordTypeMap;
}

/**
 * Get the existing Child Records by the relationship "AssoForm".
 */
ACABASE.prototype.getExistingChildsMap = function(parentRecordID,
		associatedFormsFlag) {
	var capScriptModels = aa.cap.getChildByMasterID(parentRecordID).getOutput();
	var existingRapTypeAndIDMap = aa.util.newHashMap();
	if (capScriptModels == null || capScriptModels.length <= 0) {
		return null;
	}
	for (var i = 0; i < capScriptModels.length; i++) {
		var capScriptModel = capScriptModels[i];
		if (capScriptModel != null) {
			var project = capScriptModel.getProjectModel();
			if (capScriptModel.getCapID() != null
					&& project != null
					&& project.getProject() != null
					&& associatedFormsFlag.equals(project.getProject()
							.getRelationShip())) {
				existingRapTypeAndIDMap.put(capScriptModel.getCapType()
						.getAlias()
						+ "||" + capScriptModel.getCapID().toKey(),
						capScriptModel.getCapID());
			}
		}
	}
	return existingRapTypeAndIDMap;
}

/**
 * Create Record, Application Hierarchy and its APO information.
 */
ACABASE.prototype.batchCreateRecordsWithAPO = function(capTypeList,
		parentIDModel) {
	var sectionNameList = aa.util.newArrayList();
	sectionNameList.add("Address");
	sectionNameList.add("Parcel");
	logDebug2("parentIDModel", parentIDModel);
	logDebug2("capTypeList", capTypeList);
	logDebug2("sectionNameList", sectionNameList);
	var recordIDList = aa.cap.batchCreateChildRecords(parentIDModel,
			capTypeList, sectionNameList).getOutput();
	return recordIDList;
}

/**
 * convert ASIT to array
 */
ACABASE.prototype.asitToArray = function(asit) {
	var tsmfldi = asit.getTableField().iterator();
	var tsmcoli = asit.getColumns();
	var rows = new Array();
	var numrows = 0;

	while (tsmfldi.hasNext()) {
		var row = {};
		for (var i = 0; i < tsmcoli.size() && tsmfldi.hasNext(); i++)// cycle

		{
			row[tsmcoli.get(i).getColumnName()] = tsmfldi.next();

		}
		rows.push(row);
		numrows++;
	}

	return rows;
}

logDebug2 = function(a, b) {
	var Prefix = aa.getServiceProviderCode() + " : "
			+ aa.env.getValue("CurrentUserID");
	aa.print(Prefix + " >> " + a + " : " + b);
	aa.debug(Prefix + " >> " + a, b);
}

printMethods = function(object) {
	for (x in object.getClass().getMethods()) {
		logDebug2("Obj Method ", object.getClass().getMethods()[x].getName());
	}
}
/****************************************************************************************/
/*****************************************************************************************/
/**
 * Copy documents from parentCapId to toCapID
 * 
 * @param toCapID
 * @param parentCapId
 */
ACABASE.prototype.copyDocuments=function (toCapID, parentCapId) {
	aa.debug("***** copyDocuments");
	aa.debug("CopyDocuments from capID:" , parentCapId);
	aa.debug("CopyDocuments to capID:" , toCapID);
	var capDocResult = aa.document.getDocumentListByEntity(parentCapId, "CAP");
	if (capDocResult.getSuccess()) {
		if (capDocResult.getOutput().size() > 0) {
			for (index = 0; index < capDocResult.getOutput().size(); index++) {
				var documentModel = capDocResult.getOutput().get(index);
				var res = aa.document.createDocumentAssociation(documentModel,toCapID, "CAP");
			}
		}
	}
}
/**
 * copy Documents Parent to current record if there
 * 
 * @param {currentCapId}
 *            currentCapId - capID from CapModel
 * @param {parentCapId}
 *            parentCapId - Parent CapID destination record.
 */
ACABASE.prototype.copyDocumentsFromAnotherRecordACA=function (currentCapId, parentCapId) {
	aa.debug("***** copyDocumentsFromAnotherRecordACA",'');
	var adsAdaptor = getADSAdapter()
	var currentUserID = aa.env.getValue("CurrentUserID");
	var parentDocumentList = aa.document.getCapDocumentList(parentCapId,currentUserID).getOutput();
	for ( var i in parentDocumentList) {
		var documentModel = parentDocumentList[i];
		var docNbr = documentModel.getDocumentNo();
		var entityModel = aa.proxyInvoker.newInstance("com.accela.v360.document.EntityModel").getOutput();
		entityModel.setServiceProviderCode(aa.getServiceProviderCode());
		entityModel.setEntityID(documentModel.getEntityID());
		entityModel.setEntityType(documentModel.getEntityType());
		documentModel = adsAdaptor.getDocumentWithContent(entityModel, docNbr);
		documentModel.setCapID(currentCapId);
		documentModel.setEntityType("TMP_CAP");
		documentModel.setEntityID(currentCapId.toString());
		documentModel.setRefServProvCode(aa.getServiceProviderCode());
		documentModel.setFileKey(String(docNbr));
		documentModel.setSocComment("Partial CAP Document");
		var createDocResult = aa.document.createDocument(documentModel);
		if (createDocResult.getSuccess()) {
			aa.debug("ADVM create document success",'');
		} else {
			aa.debug("**ERROR**ADVM create document failed : " ,  createDocResult.getErrorMessage());
		}
	}
}
/**
 * get the ADS Adapter model.
 * 
 * @returns ADSAdaptor
 */
getADSAdapter=function () {
	var generalSettingBusiness = aa.proxyInvoker.newInstance("com.accela.aa.communication.business.GeneralSettingBusiness").getOutput();
	var parameters = generalSettingBusiness.getGeneralEdmsSettingConfig(aa.getServiceProviderCode());
	var EDMSParams = getEDMSParamsHashMap(parameters);
	var adsAdaptor = aa.proxyInvoker.newInstance("com.accela.av360.commons.document.adaptors.ADSAdaptor",[ EDMSParams ]).getOutput();
	return adsAdaptor;
}
/**
 * get EDMS paramters HashMap.
 * 
 * @param EDMSParamsString
 * @returns EDMSParams
 */
getEDMSParamsHashMap=function (EDMSParamsString) {
	var EDMSParams = aa.util.newHashMap();
	var nameValuePairs = EDMSParamsString.split(";");
	for (var i = 0; i < nameValuePairs.length; i++) {
		var nameValuePair = nameValuePairs[i].split("=", 2);
		if (nameValuePair.length != 2) {
			// throw new Exception("Invalid name/value pair in EDMS_PARAMS");
		}
		EDMSParams.put(nameValuePair[0].trim(), nameValuePair[1].trim());
	}
	return EDMSParams;
}
asiTableValObj=function (ColumnName, FieldValue,ReadOnly) {
	this.columnName =ColumnName;
	this.fieldValue =FieldValue;
	this.readOnly = ReadOnly;
	this.hasValue = Boolean(FieldValue != null & FieldValue != "");
	asiTableValObj.prototype.toString = function() {
		return this.hasValue ? String(this.fieldValue) : String("")
	}
}
/******************************************************************************************/
/******************************************************************************************/