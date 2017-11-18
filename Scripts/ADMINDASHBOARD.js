/*------------------------------------------------------------------------------------------------------/
| Program		: ADMINDASHBOARD.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 20/03/2017 11:17:43
|eval(getScriptText("EXT_ADMIN_HANDLEEVENTS"));
|eval(getScriptText("ADMINDASHBOARD.DEFINITION"));
/------------------------------------------------------------------------------------------------------*/
var isRtl = "${DIRECTION}" == "rtl";
var north;
var center;
var east;
var _logViewer;
var logStore;
var usersGrid;

function exec(params, handler, mask) {
	if (mask) {
		Ext.getBody().mask("Loading...");
	}
	execScript("EXT_ADMIN_HANDLEEVENTS", params, handler, "execscriptbycode")
}
function execScript(script, params, handler, action) {
	if (!params) {
		params = {};
	}
	if (!action) {
		action = "execscript";
	}

	params["SCRIPT"] = script;
	Ext.Ajax.request({
		url : 'ADS?action=' + action,
		params : params,

		success : function(res) {
			Ext.getBody().unmask()
			if (handler) {
				handler(true, res.responseText);
			}

		},
		failure : function() {
			Ext.getBody().unmask()
			if (handler) {
				handler(false, "");
			}
		}
	});
}
Ext.onReady(function() {

	Ext.tip.QuickTipManager.init();
	Ext.Loader.setConfig({
		enabled : true
	});
	Ext.Loader.setPath('Ext.ux', 'web/lib/ext-4.2/examples/ux');

	Ext.require([ 'Ext.grid.*', 'Ext.data.*', 'Ext.ux.grid.FiltersFeature', 'Ext.toolbar.Paging', 'Ext.ux.ajax.JsonSimlet', 'Ext.ux.ajax.SimManager' ]);
	//fix for Accela style
	var loader = new ScriptLoader(start)
	loader.includeCSS("web/css/icons.css")
	loader.includeCSS("web/lib/ext-4.2/examples/ux/grid/css/GridFilters.css")
	loader.includeCSS("web/lib/ext-4.2/examples/ux/grid/css/RangeMenu.css")

	loader.includeJS("ADS?action=getasitscript&ASIT=ADMINDASHBOARD.DEFINITION");

	loader.load();

	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = '';

	style.innerHTML += ".kpi-text {text-align: center;white-space: nowrap; text-transform: uppercase;color: #a0a7b8; font-weight: 800; font-size: 10px;}\n";
	style.innerHTML += ".kpi-counter {text-align: center;font-size: 20px;color: #878ea2; font-weight: 500;  padding-bottom: 7px;}\n";
	style.innerHTML += ".thumb-wrap{float: left;margin: 4px;margin-right: 0; padding: 5px; border:1px solid #dddddd; width:150px}\n";
	style.innerHTML += ".x-item-over{border:1px solid #dddddd;background: #efefef url(web/lib/ext-4.2/examples/view/over.gif) repeat-x left top;padding: 4px;}\n";
	style.innerHTML += ".x-item-selected{background: #eff5fb url(web/lib/ext-4.2/examples/view/selected.gif) no-repeat right bottom;border:1px solid #99bbe8; padding: 4px;}\n";

	document.getElementsByTagName('head')[0].appendChild(style);

})
function start() {
	document.title = "Accela Business Rules Dashboard";
	Ext.getBody().setStyle("font-size", "");

	var north = createCounters();
	east = Ext.create("Ext.panel.Panel", {
		title : "Servers",
		collapsible : true,
		tools : [ {
			type : 'refresh',
			tooltip : 'Refresh Data',
			handler : function(event, toolEl, panelHeader) {
				loadServers()
			}
		} ],
		region : "east",
		layout : {
			type : 'vbox'

		},
		overflowY : "auto",
		defaults : {
			margin : 10
		},
		width : 220,
		items : []
	})
	logStore = Ext.create('Ext.data.Store', {
		model : 'logitem',
		autoLoad : true,
		remoteSort : true,
		remoteFilter : true,

		pageSize : 20,
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_ADMIN_HANDLEEVENTS&CMD=listLogs',

			reader : {
				type : 'json',
				root : 'data',
				totalProperty : 'total'
			}
		},
		listeners : {
			load : function(store, records, success, eOpts) {
				if (!success) {
					showError("${tr.Error While Retreiving Data From Server}");
				}
			}
		},
		sorters : [ {
			property : 'ID',
			direction : 'DESC'
		} ],
		filters : [ {
			property : 'AGENCY',
			value : '${se.serviceProviderCode}'
		} ]

	});
	var filters = {
		ftype : 'filters',

		encode : true
	};
	var center = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		title : "Execution Logs",
		disableSelection : true,
		forceFit : true,
		selType : "rowmodel",
		width : "50%",
		store : logStore,
		features : [ filters, groupingFeature, {
			ftype : "rowwrap"
		} ],
		split : true,
		defaults : {
			sortable : true
		},
		viewConfig : {

			enableTextSelection : true
		},
		columns : [ {
			dataIndex : "EXECSTATUS",
			text : "${tr.Status}",
			width : '20',

			filterable : true,
			tdCls : 'search_item_grid wrap-text',
			renderer : function(value, metadata, record) {

				var img = "icons/icon16/unknown.png"
				if (value == 'SUCCESS') {
					img = "icons/icon16/info.png"
				} else if (value == 'WARN') {
					img = "icons/icon16/warn.png"
				} else if (value == 'ERROR') {
					img = "icons/icon16/error.png"
				}
				return '<img src="' + img + '" hspace="3" />'
			}

		}, {
			dataIndex : "SERVER",
			text : "${tr.Server}",
			filterable : true,
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "CAPID",
			text : "${tr.Record ID}",
			filterable : true,
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "ALTID",
			text : "${tr.ALT ID}",
			filterable : true,
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "EVENT",
			text : "${tr.Event}",
			filterable : true,

			tdCls : 'search_item_grid wrap-text',
			renderer : function(value, metadata, record) {
				var label = value;
				var newLabel = label[0];
				for (i = 1; i < label.length; i++) {
					var character = label[i]
					if (character == character.toUpperCase()) {
						newLabel += " ";
					}
					newLabel += character;
				}
				return newLabel;

			}
		}, {
			dataIndex : "REC_USER",
			text : "${tr.User}",
			filterable : true,
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "REC_DATE",
			xtype : "datecolumn",
			format : "d/m/Y H:i:s",
			text : "${tr.Date}",
			filterable : true,
			filter : {
				type : 'date' // specify type here or in store fields config
			},
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "EXECTIME",
			align : "right",
			xtype : 'numbercolumn',
			filterable : true,
			filter : {
				type : 'numeric' // specify type here or in store fields config
			},
			text : "${tr.Execution Time}",
			tdCls : 'search_item_grid wrap-text'
		} ],
		// paging bar on the bottom
		bbar : Ext.create('Ext.PagingToolbar', {
			store : logStore,
			pageSize : logStore.pageSize,
			displayInfo : true,
			displayMsg : '{0} - {1} of {2}',
			emptyMsg : "No Hisotry to display",
			plugins : [ new Ext.ux.grid.PageSize({
				beforeText : "Rows",
				afterText : ""
			}) ]
		}),

		listeners : {
			celldblclick : function(searchGrid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				if (!_logViewer) {
					_logViewer = new LogViewer();
				}
				exec({
					ID : record.get("ID"),
					CMD : "getSingleLog"
				}, openLog,true)

			},
			scope : this
		}
	});
	var sql1 = "select count(distinct SSO_USER_NAME) TOTAL from ESSO_SESSIONS where SSO_SESSION_STATUS='ACTIVE'"
	var sql2 = "select count(*) TOTAL from PUSER where status ='ENABLE'";

	var activeUsers = createGaugeChart(240, 160, "Active Sessions %", sql1, sql2, null, "Category", "Count");
	activeUsers.id = "CHART_ACTIVE_SESSIONS";

	var sql = "select SSO_USER_NAME NAME, count(*) TOTAL from ESSO_SESSIONS where SSO_SESSION_STATUS='ACTIVE' group by SSO_USER_NAME"

	usersGrid = createGridChart(240, 160, "Active Users", sql, null, "User", "Sessions")
	usersGrid.id = "CHART_USER_GRID";
	var sqlErrors = "select  convert(char(5), REC_DATE, 108) NAME, count(*) TOTAL from BRULES_LOGS where EXECSTATUS='ERROR' and AGENCY='${se.serviceProviderCode}' and REC_DATE > DATEADD(HOUR, -1, GETDATE()) group by convert(char(5), REC_DATE, 108)  "
	var chartErros = createChart("column", 500, 160, "Errors in last hour", sqlErrors, null, "", "")
	chartErros.id = "CHART_ERROS";
	chartErros.flex = 4;
	activeUsers.flex = 1;
	usersGrid.flex = 1;
	south = Ext.create("Ext.panel.Panel", {
		xtype : "panel",
		layout : {
			type : 'hbox',
			align : 'stretch'
		},
		region : "south",
		height : 175,
		defaults : {
			margin : 5
		},
		items : [ chartErros, activeUsers, usersGrid ]
	});

	var viewport = Ext.create('Ext.container.Viewport', {
		layout : "border",
		rtl : isRtl,
		items : [ north, center, east, south ]

	});
	loadServers()
	setInterval(function() {
		var autoUpdate = Ext.getCmp("chk_autoupdate").pressed;
		if (autoUpdate) {
			refreshKpis()
		}

	}, 60000);
}

function openLog(status, response) {
	_logViewer.open(Ext.decode(response))
}