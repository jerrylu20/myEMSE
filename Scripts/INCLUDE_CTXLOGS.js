/*------------------------------------------------------------------------------------------------------/
| Program		: INCLUDE_CTXLOGS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 01/12/2016 13:08:20
|
/------------------------------------------------------------------------------------------------------*/

if (typeof DAO === "undefined") {
	eval(getScriptText("INCLUDE_DAO"));
}
function CTXLOGS(id) {
	DBO.call(this, "BRULES_LOGS", "ID", id);
}
CTXLOGS.prototype = Object.create(DBO.prototype);
CTXLOGS.prototype.constructor = CTXLOGS;
CTXLOGS.TABLENAME = "BRULES_LOGS";
CTXLOGS.FIELDS = {};
CTXLOGS.FIELDS.ID = "ID";
CTXLOGS.FIELDS.CAPID = "CAPID";
CTXLOGS.FIELDS.EVENT = "EVENT";
CTXLOGS.FIELDS.REC_USER = "REC_USER";
CTXLOGS.FIELDS.REC_DATE = "REC_DATE";
CTXLOGS.FIELDS.EXECLOG = "EXECLOG";
CTXLOGS.FIELDS.EXECSTATUS = "EXECSTATUS";
CTXLOGS.FIELDS.EXECTIME = "EXECTIME";
CTXLOGS.FIELDS.AGENCY = "AGENCY";
CTXLOGS.FIELDS.ALTID = "ALTID";
CTXLOGS.FIELDS.SERVER = "SERVER";
CTXLOGS.createEntry = function(event, capid, time, logs) {

	warncount = 0;
	errorcount = 0
	for ( var x in logs) {
		if (logs[x].LEVEL == "WARN") {
			warncount++;
		} else if (logs[x].LEVEL == "ERROR") {
			errorcount++;
		}
	}
	var status = "SUCCESS";
	if (errorcount > 0) {
		status = "ERROR";
	} else if (warncount > 0) {
		status = "WARN";
	}
	var entry = new CTXLOGS();
	entry.setField(CTXLOGS.FIELDS.CAPID, capid.toString())
	entry.setField(CTXLOGS.FIELDS.EVENT, event)
	entry.setField(CTXLOGS.FIELDS.EXECLOG, JSON.stringify(logs));
	entry.setField(CTXLOGS.FIELDS.REC_USER, aa.getAuditID())
	entry.setField(CTXLOGS.FIELDS.REC_DATE, new Date())
	entry.setField(CTXLOGS.FIELDS.EXECSTATUS, status);
	entry.setField(CTXLOGS.FIELDS.EXECTIME, time)
	entry.setField(CTXLOGS.FIELDS.AGENCY, aa.getServiceProviderCode())
	entry.setField(CTXLOGS.FIELDS.ALTID, capid.getCustomID())
	var bizUrl = com.accela.util.AVProperties.getProperty("av.biz.url");
	var u = new java.net.URL(bizUrl);

	entry.setField(CTXLOGS.FIELDS.SERVER, u.getHost())

	entry.save()
}
CTXLOGS.clear = function() {
	new DAO(CTXLOGS.TABLENAME).execSimpleDelete("delete from " + CTXLOGS.TABLENAME + " where 1=1", [])
}
CTXLOGS.listAll = function(start, limit, objFilter, objSort, keepLogs) {
	var stime = new Date().getTime();
	var filter = {};
	var orderBy = null;

	if (objSort && objSort.length > 0) {
		orderBy = objSort[0].property + " " + objSort[0].direction
	}

	start = parseInt(start, 10);
	limit = parseInt(limit, 10);

	var ret = new DAO(CTXLOGS.TABLENAME).execAdvancedQuery(objFilter, orderBy, true);
	var jrows = [];
	for (r in ret) {
		var row = ret[r];
		if (r >= start && jrows.length < limit) {
			if (!keepLogs) {
				delete row["EXECLOG"]
			}

			jrows.push(row)
		}
		if (jrows.length > limit) {
			break;
		}
	}

	var etime = new Date().getTime();
	var time = (etime - stime) / 1000;
	var response = {};
	response["time"] = time;
	response["data"] = jrows;
	response["total"] = ret.length;
	aa.print(JSON.stringify(response));
}