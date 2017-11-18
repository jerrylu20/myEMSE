/*------------------------------------------------------------------------------------------------------/
| Program		: CUSTOM:GLOBALSETTINGS/RULES/BUSINESS RULES/GRBR/BRULES.ACTIONS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 29/11/2016 19:45:01
|
/------------------------------------------------------------------------------------------------------*/
function getQueryStrings() {
	var assoc = {};
	var decode = function(s) {
		return decodeURIComponent(s.replace(/\+/g, " "));
	};
	var queryString = location.search.substring(1);
	var keyValues = queryString.split('&');

	for ( var i in keyValues) {
		var key = keyValues[i].split('=');
		if (key.length > 1) {
			assoc[decode(key[0])] = decode(key[1]);
		}
	}

	return assoc;
}
function base64toBlob(base64, mimeType) {
	// convert base64 to raw binary data held in a string
	// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
	var byteString = atob(base64);

	// write the bytes of the string to an ArrayBuffer
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	// write the ArrayBuffer to a blob, and you're done
	var bb = new Blob([ ab ], {
		type : mimeType
	});
	return bb;
}
function execScriptByCode(code, params, handler) {
	execScript(code, params, handler, "execscriptbycode")
}
function execScript(script, params, handler, action) {
	if (!params) {
		params = {};
	}
	if (!action) {
		action = "execscript";
	}
	params["ASIT"] = "${ASIT}";
	params["SCRIPT"] = script;
	Ext.Ajax.request({
		url : 'ADS?action=' + action + '&capID=' + capID,
		params : params,

		success : function(res) {
			if (handler) {
				handler(true, res.responseText);
			}

		},
		failure : function() {
			if (handler) {
				handler(false, "");
			}
		}
	});
}
function setRecordType(path) {
	_recordType = path;
	if (path == "") {
		Ext.get("RECTYPE_SPAN").setHTML("All. <i>for specified record type, please click on the record type you want from the tree on the left</i>");
	} else {
		Ext.get("RECTYPE_SPAN").setHTML(path);
	}

}
function onRecordTypeClick(treepanel, record, item, index, e, eOpts) {
	var path = record.getPath("text", "/");
	path = path.substring(6)
	setRecordType(path)
	if (Ext.getCmp("tlb_filter_recordtype").pressed) {
		var paths = path.split("/");
		grid.store.filters.removeAtKey("RMODULE");
		grid.store.filters.removeAtKey("RTYPE");
		grid.store.filters.removeAtKey("RSUBTYPE");
		grid.store.filters.removeAtKey("RCATEGORY");
		if (paths[0]) {
			grid.store.addFilter({
				id : "RMODULE",
				property : "RMODULE",
				value : paths[0]
			}, false)
		}
		if (paths[1]) {
			grid.store.addFilter({
				id : "RTYPE",
				property : "RTYPE",
				value : paths[1]
			}, false)
		}

		if (paths[2]) {
			grid.store.addFilter({
				id : "RSUBTYPE",
				property : "RSUBTYPE",
				value : paths[2]
			}, false)
		}

		if (paths[3]) {
			grid.store.addFilter({
				id : "RCATEGORY",
				property : "RCATEGORY",
				value : paths[3]
			}, false)
		}
		grid.store.loadPage(1);
	}

}
function handleServerResponse(status, response) {
	var ret = eval(response)[0]
	if (!ret.success == true) {
		throw ret.message;
	}
	return ret;

}

function onValidityCheckDone(status, response) {
	Ext.getCmp("tlb_validate_all").enable()
	Ext.getCmp("tlb_validate").enable()
	try {
		handleServerResponse(status, response)
		grid.getStore().reload();

	} catch (e) {

		showError(e)

	}

}

function openRule(record) {
	var mode = record.get("RMODE");
	if (mode == "complex") {
		if (_ruleFormComplex == null) {
			_ruleFormComplex = new RuleBeta();
		}
		_ruleForm = _ruleFormComplex;
	} else {
		if (_ruleFormSimple == null) {
			_ruleFormSimple = new Rule();
		}
		_ruleForm = _ruleFormSimple;
	}

	if (record.data.PID != "" || record.data.ID == "-1") {
		_ruleForm.open(record)
	} else {
		_ruleForm.record = record;
		grid.getEl().mask("loading")
		execScriptByCode("EXT_BRE_HANDLEEVENTS", {
			CMD : 'getRule',
			ID : record.get("ID")

		}, function(status, response) {
			grid.getEl().unmask()
			try {
				var ret = handleServerResponse(status, response)
				var data = ret.DATA;

				for ( var x in data) {
					_ruleForm.record.set(x, data[x]);
				}
				grid.getStore().commitChanges();
				_ruleForm.open(_ruleForm.record)
			} catch (e) {
				showError(e)
			}

		})
	}

}
function selectTreeNodes(tree, record) {
	record.eachChild(function(n) {
		if (n.data.admin) {
			n.getOwnerTree().getSelectionModel().select(n, true)
			selectTreeNodes(n.getOwnerTree(), n)
		}
	})
}
function deselectTreeNodes(tree, record) {
	record.eachChild(function(n) {
		n.getOwnerTree().getSelectionModel().deselect(n);
		deselectTreeNodes(n.getOwnerTree(), n)
	})
}
function onAgencyChange(selModel, recs) {
	_agencies = [];
	for ( var x in recs) {
		var rec = recs[x];
		_agencies.push(rec.data.value)
	}
	if (Ext.getCmp("tlb_filter_agency").pressed) {
		grid.store.filters.removeAtKey("_AGENCIES");
		if (_agencies.length > 0) {
			grid.store.addFilter({
				id : "_AGENCIES",
				property : "_AGENCIES",
				value : _agencies.join(',')
			}, false)
			//agencyTree.setTitle("${tr.Agencies}: selected")
			//Ext.get("AGENCIES_SPAN").setHTML(_agencies.join(','))
		} else {
			//Ext.get("AGENCIES_SPAN").setHTML("All")
			//agencyTree.setTitle("${tr.Agencies}: All")
		}
		grid.store.loadPage(1);
	}
	console.log(_agencies)
	recTree.getStore().reload()

}
function agenciesLoad(node) {

	if (node.data.current) {
		node.data.text = "<b>" + node.data.text + "</b>";
	}
	if (node.data.admin) {
		node.data.icon = 'icons/icon16/organization.png'
		_agencyCount++;
	} else {
		node.data.icon = 'icons/icon16/organizaiton-disabled.png'
	}

	node.eachChild(function(n) {
		agenciesLoad(n)
	})

}
function onContextMenuClick(btn) {
	console.log(btn.text + " clicked")
	try {

		switch (btn.id_aa) {
		case "add":
			var types = _recordType.split("/");
			var stra = '${se.serviceProviderCode}'
			if (_agencies.length > 0) {
				stra = _agencies.join(',');
			}
			var rec = Ext.create('bruleitem', {
				"ID" : -1,
				"VERSION" : "1.0.0",
				'RORDER' : '1',
				'AGENCIES' : stra,
				'RAUDIENCE' : "BOTH",
				'RSCOPE' : '',
				'RMODE' : btn.aa_mode,
				"REC_STATUS" : "A"

			});
			//fields : [ 'ID', 'RNAME', 'RDESCRIPTION', 'REVENT', 'RMODULE', 'RTYPE', 'RSUBTYPE', 'RCATEGORY', 'REC_STATUS', 'REC_USER', 'REC_DATE' ]
			var types = _recordType.split("/");
			if (types[0]) {
				rec.set("RMODULE", types[0])
			}
			if (types[1]) {
				rec.set("RTYPE", types[1])
			}
			if (types[2]) {
				rec.set("RSUBTYPE", types[2])
			}
			if (types[3]) {
				rec.set("RCATEGORY", types[3])
			}
			openRule(rec)
			break;
		case "open":
			var record = btn.record;
			if (!record) {
				var records = grid.getSelectionModel().getSelection();
				if (records.length != 1) {
					throw "${tr.Please select one rule}";
				}
				record = records[0]
			}
			openRule(record)
			break;
		case "check":
			var record = btn.record;
			var ids = [];
			if (record) {
				ids.push(record.get("ID"))
			} else {
				var records = grid.getSelectionModel().getSelection();
				for ( var x in records) {
					var r = records[x]
					ids.push(r.get("ID"))
				}
			}
			if (ids.length == 0) {
				throw "${tr.Please select at least one rule}";
			}
			checkValidity(ids)
			break;
		case "checkall":

			checkValidity()
			break;
		case "recycle":
			if (btn.pressed) {
				Ext.getCmp("btn_main_restore").enable();
				Ext.getCmp("btn_main_delete").disable();
			} else {
				Ext.getCmp("btn_main_restore").disable();
				Ext.getCmp("btn_main_delete").enable();
			}
			grid.store.filters.removeAtKey("REC_STATUS");
			grid.store.addFilter({
				id : "REC_STATUS",
				property : "REC_STATUS",
				value : btn.pressed ? "I" : "A"
			}, false)
			grid.store.loadPage(1);
			break;
		case "history":
			openHistory()
			break;
		case "showlogs":
			openLogs();
			break;
		case "run":
			var record = btn.record;
			if (!record) {
				var records = grid.getSelectionModel().getSelection();
				if (records.length != 1) {
					throw "${tr.Please select one rule}";
				}
				record = records[0]
			}

			openDebugger(record);
			break;
		case "rulehistory":
			var record = btn.record;
			if (!record) {
				var records = grid.getSelectionModel().getSelection();
				if (records.length != 1) {
					throw "${tr.Please select one rule}";
				}
				record = records[0]
			}

			openHistory(record)
			break;
		case "share":
			shareRules()
			break;
		case "refactor":
			showRefactor()
			break;
		case "delete":
			changeStatus("I")
			break;
		case "restore":
			changeStatus("A")
			break;
		case "maximize":
			window.open("ADS?Template=web/templates/base.htm&VIEW=BRULES")
			break;
		case "refresh":

			grid.getStore().reload();
			break;
		case "findsimilar":
			findSimilar(btn);
			break;

		case "clearfilters":
			setRecordType("")
			orgTree.getSelectionModel().deselectAll();
			recTree.getSelectionModel().deselectAll();
			grid.store.clearFilter(true);
			var rbinbtn = Ext.getCmp("tlb_recycle").pressed;
			grid.store.addFilter({
				id : "REC_STATUS",
				property : "REC_STATUS",
				value : rbinbtn ? "I" : "A"
			}, false)
			grid.store.loadPage(1);

			break;
		case "refreshpage":
			Ext.MessageBox.show({
				title : 'Please wait',
				msg : 'Loading items...',
				progressText : 'Initializing...',
				width : 300,
				progress : true,
				closable : false

			});
			document.location.href = document.location.href;
			break;
		case "filter_agency":
			grid.store.filters.removeAtKey("_AGENCIES");
			grid.store.loadPage(1);
			break;
		case "filter_recordtype":
			grid.store.filters.removeAtKey("RMODULE");
			grid.store.filters.removeAtKey("RTYPE");
			grid.store.filters.removeAtKey("RSUBTYPE");
			grid.store.filters.removeAtKey("RCATEGORY");
			grid.store.loadPage(1);
			break;
		case "filter_error":
			grid.store.filters.removeAtKey("VALIDATION");
			if (btn.pressed) {
				grid.store.addFilter({
					id : "VALIDATION",
					property : "VALIDATION",
					value : "$NOT$VALID"
				}, false)
			}
			grid.store.loadPage(1);
			break;
		case "filter_myrules":
			grid.store.filters.removeAtKey("REC_USER");
			if (btn.pressed) {
				grid.store.addFilter({
					id : "REC_USER",
					property : "REC_USER",
					value : "${se.userId}"
				}, false)
			}
			grid.store.loadPage(1);
			break;
		case "filter_today":
			grid.store.filters.removeAtKey("_TODAY");
			if (btn.pressed) {
				grid.store.addFilter({
					id : "_TODAY",
					property : "_TODAY",
					value : "TODAY"
				}, false)
			}
			grid.store.loadPage(1);
			break;

		case "tag":
			Ext.MessageBox.prompt('${tr.Tag}', '${tr.Please enter Tag Name}:', doTag);
			break;
		case "import":
			doImport()
			break;
		case "export":
			doExport()
			break;
		case "restoretag":
			Ext.MessageBox.prompt('${tr.Restore Tag}', '${tr.Please enter Tag Name}:', doUnTag);
			break;
		case "restorefromHistory":
			restoreFromHistory(btn);
			break;
		default:
			showInfo(btn.text + " is not implemented yet")
		}

	} catch (e) {
		showError(e)
	}
}
function findSimilar(btn) {
	var rec = btn.record;
	var module = rec.get("RMODULE");
	var type = rec.get("RTYPE");
	var subtype = rec.get("RSUBTYPE")
	var category = rec.get("RCATEGORY")
	//recTree.collapseAll()
	var root = recTree.getRootNode();
	var rmodule = null;
	var rtype;
	var rsubtype;
	var rcategory;
	if (module != "*") {
		for ( var x in root.childNodes) {
			var n = root.childNodes[x];
			if (n.data.text == module) {
				rmodule = n;
				rmodule.expand();
				break;
			}
		}
	}
	if (type != "*" && rmodule) {
		for ( var x in rmodule.childNodes) {
			var n = rmodule.childNodes[x];
			if (n.data.text == type) {
				rtype = n;
				rtype.expand();
				break;
			}
		}
	}
	if (subtype != "*" && rtype) {
		for ( var x in rtype.childNodes) {
			var n = rtype.childNodes[x];
			if (n.data.text == subtype) {
				rsubtype = n;
				rsubtype.expand();
				break;
			}
		}
	}
	if (category != "*" && rsubtype) {
		for ( var x in rsubtype.childNodes) {
			var n = rsubtype.childNodes[x];
			if (n.data.text == category) {
				rcategory = n;
				//rcategory.expand();
				break;
			}
		}
	}
	if (rcategory) {
		recTree.getSelectionModel().select(rcategory);
		onRecordTypeClick(recTree, rcategory)
	} else if (rsubtype) {
		recTree.getSelectionModel().select(rsubtype);
		onRecordTypeClick(recTree, rsubtype)

	} else if (rtype) {
		recTree.getSelectionModel().select(rtype);
		onRecordTypeClick(recTree, rtype)
	} else if (rmodule) {
		recTree.getSelectionModel().select(rmodule);
		onRecordTypeClick(recTree, rmodule)
	}
}
function restoreFromHistory(btn) {
	var record = btn.record;
	execScriptByCode("EXT_BRE_HANDLEEVENTS", {
		CMD : btn.id_aa,
		ID : record.get("ID")

	}, function(status, response) {
		try {
			handleServerResponse(status, response)
			grid.getStore().reload();
		} catch (e) {
			showError(e)
		}

	})
}
function doTag(btn, tag) {
	try {

		if (btn == "ok") {
			if (tag == "") {
				throw ("Please enter tag Name")
			}
			Ext.getCmp("tlb_restoretag").disable()
			Ext.getCmp("tlb_tag").disable()
			execScriptByCode("EXT_BRE_HANDLEEVENTS", {
				CMD : "tag",
				TAG : tag,
				COMMENT : ""

			}, onTagDone)
		}
	} catch (e) {
		showError(e)
	}
}
function doUnTag(btn, tag) {
	try {

		if (btn == "ok") {
			if (tag == "") {
				throw ("Please enter tag Name")
			}
			Ext.getCmp("tlb_restoretag").disable()
			Ext.getCmp("tlb_tag").disable()
			execScriptByCode("EXT_BRE_HANDLEEVENTS", {
				CMD : "restoreTag",
				TAG : tag,
				COMMENT : ""

			}, onTagDone)
		}
	} catch (e) {
		showError(e)
	}
}
function onTagDone(status, response) {
	Ext.getCmp("tlb_restoretag").enable()
	Ext.getCmp("tlb_tag").enable()
	try {
		handleServerResponse(status, response)
		grid.getStore().reload();

	} catch (e) {

		showError(e)

	}

}
function checkValidity(ids) {
	Ext.getCmp("tlb_validate_all").disable()
	Ext.getCmp("tlb_validate").disable()
	if (ids == null) {
		ids = "";
	} else {
		ids = ids.join(",")
	}
	execScriptByCode("EXT_BRE_HANDLEEVENTS", {
		CMD : "checkValidity",
		IDS : ids
	}, onValidityCheckDone)
}
function openDebugger(record) {
	if (_debugger == null) {
		_debugger = new Debugger()
	} else {
		if (_debugger.jseditor == null) {
			_debugger = new Debugger()
		}
	}
	_debugger.open(record)
}
function doImport() {
	var form = Ext.create('Ext.form.Panel', {

		bodyPadding : '10 10 0',
		region : 'center',
		defaults : {
			anchor : '100%',
			allowBlank : false,
			msgTarget : 'side',
			labelWidth : 80
		},

		items : [ {
			xtype : 'filefield',
			id : 'form-file',
			emptyText : 'Select an export file',
			fieldLabel : 'Export File',
			name : 'EXPFILE',
			buttonText : '',
			buttonConfig : {
				iconCls : 'upload-icon'
			}
		} ],

		buttons : [ {
			text : 'Import',
			handler : function() {

			}
		}, {
			text : 'Reset',
			handler : function() {
				this.up('form').getForm().reset();
			}
		} ]
	});
	var win = new Ext.Window({
		closable : true,
		resizable : false,

		maximizable : false,
		collapsible : false,
		//closeAction : "hide",
		title : "${tr.Import}",
		//iconCls : "icon-refactor16",
		width : 500,
		height : 150,
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ form ]

	});
	win.show()
}
function doExport() {
	try {

		var records = grid.getSelectionModel().getSelection();
		if (records.length == 0) {
			throw "${tr.Please select at least one rule}";
		}
		var IDS = [];
		for ( var x in records) {
			IDS.push(records[x].get("ID"));
		}
		execScriptByCode("EXT_BRE_HANDLEEVENTS", {
			CMD : "export",
			IDS : IDS.join(",")

		}, function(serverstat, response) {

			var oMyBlob = new Blob([ response ], {
				type : "text/plain",
				endings : "transparent"
			});
			window.saveAs(oMyBlob, "export.dat");
		})
	} catch (e) {
		showError(e);
	}
}
function openShare(records) {
	if (_ruleShare == null) {
		_ruleShare = new RuleShare()
	}
	_ruleShare.open(records)
}
function openHistory(record) {
	if (_historyWindow == null) {
		_historyWindow = new HistoryWindow()
	}
	_historyWindow.open(record)
}
function openLogs() {
	if (_logViewer == null) {
		_logViewer = new LogViewer()
	}
	_logViewer.open()

}
function shareRules() {
	var records = grid.getSelectionModel().getSelection();
	if (records.length == 0) {
		throw "${tr.Please select at least one rule}";
	}
	openShare(records)
}
function showRefactor() {
	if (_refactor == null) {
		_refactor = new Refactor()
	}
	_refactor.open(_recordType)
}
function changeStatus(status) {
	var records = grid.getSelectionModel().getSelection();
	if (records.length == 0) {
		throw "${tr.Please select at least one rule}";
	}
	var IDS = [];
	for ( var x in records) {
		IDS.push(records[x].get("ID"));
	}
	execScriptByCode("EXT_BRE_HANDLEEVENTS", {
		CMD : "changeStatus",
		IDS : IDS.join(","),
		STATUS : status
	}, function(serverstat, response) {
		try {

			handleServerResponse(serverstat, response)
			var records = grid.getSelectionModel().getSelection();
			grid.getStore().remove(records);
			grid.getStore().commitChanges();
			if (grid.getStore().getCount() == 0) {
				grid.getStore().reload();
			}
		} catch (e) {
			showError(e)
		}
	})

}