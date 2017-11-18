/*------------------------------------------------------------------------------------------------------/
| Program		: EXT_CUSTOM_PORTLET.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 22/08/2016 10:05:41
|
/------------------------------------------------------------------------------------------------------*/

function CUSTOMPORTLET(capId, server) {
	if (server) {
		this.server = server;
	} else {
		this.server = "/ACP/";
	}

	this.capId = capId;
}
CUSTOMPORTLET.prototype.getLanguage = function() {
	return com.accela.aa.emse.util.LanguageUtil.getCurrentLocale().getLanguage();
}

CUSTOMPORTLET.prototype.getSessionID = function() {

	/*	var dbName = "jetspeed";
		var sqlString = "select TOP 1 SSO_SESSION_ID from accela.dbo.ESSO_SESSIONS where sso_session_status ='ACTIVE' and serv_prov_code='" + aa.getServiceProviderCode()
				+ "' and sso_user_name='" + aa.getAuditID() + "' "
		var getSessionResult = aa.util.select(dbName, sqlString, null);
		var userSessionId = '';
		if (!getSessionResult.getSuccess()) {
			throw getSessionResult.getErrorMessage();
		}
	*/
	var dbName = "jetspeed";
	var strQry = "select TOP 1 SSO_SESSION_ID from accela.dbo.ESSO_SESSIONS where sso_session_status ='ACTIVE' and serv_prov_code='" + aa.getServiceProviderCode()
			+ "' and sso_user_name='" + aa.getAuditID() + "' "

	var dba = com.accela.aa.datautil.AADBAccessor.getInstance();
	var result = dba.select(strQry, []);
	ret = result.toArray()
	var ssoid = "";
	if (ret.length > 0 && ret[0][0]) {
		ssoid = ret[0][0];
	} else {

		var bizInstance = aa.proxyInvoker.newInstance("com.accela.security.AuthenticationEJB").getOutput();
		var userSession = bizInstance.getUserSession('SSO0123456', 'AC360Agency', aa.getServiceProviderCode(), aa.getAuditID(), null);
		ssoid = userSession.getSessionId();
	}
	return ssoid;
}

CUSTOMPORTLET.prototype.getASIFormMessage = function() {
	var url = this.server + "ADS?ssoId=" + this.getSessionID();
	url += "&serviceProviderCode=" + aa.getServiceProviderCode() + "&userId=" + aa.getAuditID();
	url += "&capID=" + this.capId + "&altID=" + this.capId.getCustomID();
	url += "&lang=" + this.getLanguage() + "&Template=web/specific/dma/loadDocs.htm"

	var script = "var div=document.getElementById(\"tr_tarbar_newUI\");";
	script += "var menus=$(\"[id^=CUSP]\");";

	script += "var cls=$(menus[0]).attr(\"class\");"
	script += "if(cls==\"tabSelected\"){"
	script += "	var menubar=document.getElementById(\"menu_Bar\");";
	script += "	menubar.style.display=\"none\";";
	script += "	div.innerHTML=\"\";div.style.paddingLeft=0;"
	script += "	ifrm = document.createElement(\"IFRAME\");"

	script += "	ifrm.setAttribute(\"src\",\"" + url + "\");";
	script += "	ifrm.style.width = \"98.0%\";"
	script += "	ifrm.style.height = \"99%\";"
	script += "	ifrm.frameBorder = 0;"
	script += "	ifrm.id = \"customPortlet\";"
	script += "	div.appendChild(ifrm);};"

	return "<img src='/jetspeed/accela/images/spacer.gif' onload='try{" + script + "}catch(e){alert(e.message)}'/>";
}
CUSTOMPORTLET.prototype.getFullFormMessage = function(template, view) {
	var url = this.server + "ADS?ssoId=" + this.getSessionID();
	url += "&serviceProviderCode=" + aa.getServiceProviderCode() + "&userId=" + aa.getAuditID();
	url += "&capID=" + this.capId + "&altID=" + this.capId.getCustomID();
	url += "&lang=" + this.getLanguage();
	if (template) {
		url += "&Template=" + template;
		if (view) {
			url += "&VIEW=" + view;
		}
	}
	var script = "var div=$(\".work-space\")[ 0 ];";
	
	script += "	div.innerHTML=\"\";"
	script += "ifrm = document.createElement(\"IFRAME\");"

	script += "ifrm.setAttribute(\"src\",\"" + url + "\");";
	script += "ifrm.style.width = \"98%\";"
	script += "ifrm.style.height = \"99%\";"
	script += "ifrm.frameBorder = 0;"
	script += "ifrm.id = \"customPortlet\";"
	script += "div.appendChild(ifrm);"
	return "<img src='/jetspeed/accela/images/spacer.gif' onload='try{" + script + "}catch(e){alert(e.message)}'/>";

}
CUSTOMPORTLET.prototype.getFormMessage = function(template, view) {
	var url = this.server + "ADS?ssoId=" + this.getSessionID();
	url += "&serviceProviderCode=" + aa.getServiceProviderCode() + "&userId=" + aa.getAuditID();
	url += "&capID=" + this.capId + "&altID=" + this.capId.getCustomID();
	url += "&lang=" + this.getLanguage();
	if (template) {
		url += "&Template=" + template;
		if (view) {
			url += "&VIEW=" + view;
		}
	}
	var script = "var div=document.getElementById(\"tr_tarbar_newUI\");";
	script += "var menubar=document.getElementById(\"menu_bar_\");";
	script += "menubar.style.display=\"none\";";
	script += "			div.innerHTML=\"\";div.style.paddingLeft=0;"
	script += "ifrm = document.createElement(\"IFRAME\");"

	script += "ifrm.setAttribute(\"src\",\"" + url + "\");";
	script += "ifrm.style.width = \"98%\";"
	script += "ifrm.style.height = \"99%\";"
	script += "ifrm.frameBorder = 0;"
	script += "ifrm.id = \"customPortlet\";"
	script += "div.appendChild(ifrm);"
	return "<img src='/jetspeed/accela/images/spacer.gif' onload='try{" + script + "}catch(e){alert(e.message)}'/>";

}