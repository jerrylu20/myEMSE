var showMessage = true;
var showDebug = true;
var capId= null;

var SCRIPT_VERSION = 2.0;
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//if(capId)
//aa.print("capId 1:"+capId);
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
//if(capId)
//aa.print("capId 2:"+capId);
eval(getScriptText("INCLUDES_CUSTOM"));

aa.env.setValue("ScriptReturnCode","0");
aa.env.setValue("ScriptReturnMessage", "Test Script");
aa.print("---Sample EMSE script to get cap id---");
//if(capId)
aa.print("capId :"+capId);


function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(),vScriptName);
	return emseScript.getScriptText() + "";	
}