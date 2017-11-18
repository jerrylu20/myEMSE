/*------------------------------------------------------------------------------------------------------/
| Program		: CUSTOM_LOGIN_SESSION.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLYMEN
| Created at	: 21/03/2016 11:31:48
|
/------------------------------------------------------------------------------------------------------*/
var user = aa.person.getUser(aa.getAuditID()).getOutput();
var serverConstant = aa.proxyInvoker.newInstance("com.accela.aa.aamain.systemConfig.ServerConstantBusiness").getOutput();
var modules = serverConstant.getModulesByAgency(aa.getServiceProviderCode());
var userGoups = new Array();
for (var i = 0; i < modules.size(); i++) {
	var moduleName = modules.get(i);
	var usergroup = serverConstant.getUserGroupBySysUser(aa.getServiceProviderCode(), moduleName, aa.getAuditID());
	var gname = "";
	if (usergroup != null) {
		gname = usergroup.getGroupName();

	}
	aa.print("usergroup." + moduleName + "=" + gname);
	userGoups["usergroup." + moduleName] = gname;
}

/**
 * @returns: user department
 * 
 */
function getUserDepartment() {
	var department;
	try {
		var orgService = com.accela.aa.emse.dom.service.CachedService.getInstance().getOrganizationService();
		var department = orgService.getDepartmentByUserInfo(aa.getServiceProviderCode(), aa.getAuditID());
		if(department){
			department=	department.getDeptName();
		}
		
		aa.debug("USER DEPARTMENT : ",department);

	} catch (e) {
		throw "***ERROR :getUserDepartment : " + e.message;
		department = null;
	}

	return department;
}

var digEplanURL=lookupSTDCHS("DIGEPLAN", "AUTOVUE_URL");
/**
 * 
 * @param e:
 *            Standard choice name
 * @param t:
 *            Standard choice value
 * @returns {string} n Standard choice value description
 * 
 */
function lookupSTDCHS(e, t) {
	var n;
	var r = aa.bizDomain.getBizDomainByValue(e, t);
	if (r.getSuccess()) {
		var i = r.getOutput();
		n = "" + i.getDescription();
		aa.debug("", "lookup(" + e + "," + t + ") = " + n)
	} else {
		aa.debug("", "lookup(" + e + "," + t + ") does not exist")
	}
	return n
}

aa.print("fullName=" + user.getFullName());
aa.print("department=" + user.getDeptOfUser())
aa.print("email=" + user.getEmail());
aa.print("phoneNumber=" + user.getPhoneNumber());
aa.print("usercode=" + aa.getAuditID());
aa.print("userDepartment="+getUserDepartment());
aa.print("CustomPortletTitle=Accela Custom Portlet");
aa.print("DIGEPLAN_URL="+digEplanURL);