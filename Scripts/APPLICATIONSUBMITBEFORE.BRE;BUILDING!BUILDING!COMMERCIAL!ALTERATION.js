/*------------------------------------------------------------------------------------------------------/
| Rule 			: 3:BuildingAlteration V1.0.0
| Rule 			: 5:Rule01 V1.0.0
| Program		: APPLICATIONSUBMITBEFORE.BRE:BUILDING/BUILDING/COMMERCIAL/ALTERATION
| Event			: ApplicationSubmitBefore
|
| Usage			:
| Notes			: auto generated  Script by Business Rule Engine
| Published by	: ADMIN
| Published at	: 18/05/2017 13:18:57
|
/------------------------------------------------------------------------------------------------------*/


/**
 * RULE NAME: BuildingAlteration
 * RULE ID: 3
 * RULE VERSION: 1.0.0
 */
CTX.RULEID =3;
/** BRE GENERATED SCRIPT*/
if(this.Record.Contacts['Applicant'].lastName==Lu){
//execute ADDFEE
	this.executeAction('ADDFEE',{"FeeItemCode":"SIGNPERM","Quantity":"1","AutoInvoice":"true","ID":"ADDFEE","CMD":"Add Fee","STOPONERROR":true,"CANCELEVENT":true});
}else{
}

/**
 * RULE NAME: Rule01
 * RULE ID: 5
 * RULE VERSION: 1.0.0
 */
CTX.RULEID =5;
/** BRE GENERATED SCRIPT*/
if(this.User.firstName==Admin){
//execute ADDFEE
	this.executeAction('ADDFEE',{"FeeItemCode":"BLDGPERM","Quantity":"1","AutoInvoice":"true","ID":"ADDFEE","CMD":"Add Fee","STOPONERROR":true,"CANCELEVENT":true});
}else{
}