/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDE_CTX_ACA.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 18/01/2017 12:13:03
|
/------------------------------------------------------------------------------------------------------*/
function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = com.accela.aa.emse.dom.service.CachedService.getInstance().getEMSEService();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
eval(getScriptText("INCLUDE_ACABASE"));

ACABASE.prototype.execute = function() {
	try {
		eval(getScriptText("INCLUDE_ACARECORD"));
		eval(getScriptText("INCLUDE_CTX"))
		var rec = new ACARecord(this.getCapModel());

		var scriptName = aa.env.getValue("ScriptCode") + "";

		if (scriptName.indexOf("BRULES:") == 0) {
			var category = rec.getCapType().getCategory();
			var scope = scriptName.substring(("BRULES:" + category + "/").length);

			CTX.executeRulesByRecord(rec, "pageflow", scope)
		}

	} catch (e) {
		//CTX.dumpLogs();
		aa.debug("CTXACAERROR:" + e)
		this.showMessage(e + "");
	}

}

run();