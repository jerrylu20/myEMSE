/*------------------------------------------------------------------------------------------------------/
| Program		= ADMINDASHBOARD.DEFINITION.js
| Event			= 
|
| Usage			= 
| Notes			= auto generated Record Script by Accela Eclipse Plugin 
| Created by	= SLEIMAN
| Created at	= 20/03/2017 11=23=46
|
/------------------------------------------------------------------------------------------------------*/

Ext.chart.theme.chartTheme = Ext.extend(Ext.chart.theme.Base, {
	constructor : function(config) {
		Ext.chart.theme.Base.prototype.constructor.call(this, Ext.apply({
			colors : [ '#F49D10', 'rgb(0,0,255)', 'rgb(255,0,0)', 'rgb(0,128,0)', 'rgb(128,0,128)' ],
		}, config));
	}
});
Ext.data.proxy.Server.override({
	encodeFilters : function(filters) {
		var min = [], length = filters.length, i = 0;

		for (; i < length; i++) {
			min[i] = {
				property : filters[i].property,
				value : filters[i].value,
				comparison : filters[i].operator
			};
		}
		return this.applyEncoding(min);
	},
})

Ext.define('chartModel', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'NAME',
		type : 'string'
	}, {
		name : 'TOTAL',
		type : 'double'
	} ]

});

var groupingFeature = {
	id : 'group',
	ftype : 'grouping',
	groupHeaderTpl : '{columnName} : {name} ({rows.length})',
	hideGroupedHeader : false,
	enableGroupingMenu : true
};
Ext.define('logitem', {
	extend : 'Ext.data.Model',
	fields : [ 'ID', 'CAPID', 'EVENT', 'REC_USER', 'REC_DATE', 'AGENCY', 'EXECLOG', 'EXECSTATUS', 'EXECTIME', "ALTID", "SERVER" ]
});
Ext.define('debugitem', {
	extend : 'Ext.data.Model',
	fields : [ 'LEVEL', 'RID', 'MESSAGE' ]
});
function handleServerResponse(status, response) {
	var ret = eval(response)[0]
	if (!ret.success == true) {
		throw ret.message;
	}
	return ret;

}
function createGridChart(width, height, title, sql, params, xlabel, ylabel) {
	if (!params) {
		params = {};
	}
	params.sql = sql;
	var chart = {};
	chart["xtype"] = "grid";
	chart["tools"] = [ {
		type : 'refresh',
		tooltip : 'Refresh Data',
		handler : function(event, toolEl, panelHeader) {
			panelHeader.up("panel").getStore().reload()
		}
	} ];
	chart["flex"] = 1;
	chart["width"] = width;
	chart["height"] = height;
	chart["viewConfig"] = {
		loadMask : false
	};
	chart["title"] = title;
	var store = {};
	chart["store"] = store;

	store["remoteFilter"] = false;
	store["remoteSort"] = false;
	store["autoLoad"] = true;
	store["mode"] = "local";
	store["model"] = "chartModel";

	store["proxy"] = {
		"type" : "ajax",
		"url" : "ADS?action=execscriptbycode&CMD=sql&SCRIPT=EXT_ADMIN_HANDLEEVENTS",
		"reader" : {
			"type" : "json",
			"root" : "values"
		},
		extraParams : params
	}
	chart["columns"] = [ {
		"text" : xlabel,
		"flex" : 4,
		"sortable" : true,
		"dataIndex" : "NAME",
	}, {
		"text" : ylabel,
		"flex" : 1,
		"sortable" : true,
		"align" : "right",
		"dataIndex" : "TOTAL"
	} ];
	return chart;
}

function createChart(type, width, height, title, sql, params, xlabel, ylabel) {
	if (!params) {
		params = {};
	}
	params.sql = sql;
	return {
		"xtype" : "panel",
		tools : [ {
			type : 'refresh',
			tooltip : 'Refresh Data',
			handler : function(event, toolEl, panelHeader) {
				panelHeader.up("panel").down("chart").getStore().reload()
			}
		} ],
		"layout" : "border",
		"width" : width,
		"height" : height,

		"title" : title,
		"items" : [ {
			"xtype" : "chart",
			theme : "chartTheme",
			"region" : "center",
			"animate" : true,
			"style" : "background:#fff",
			"shadow" : false,
			"loadMask" : true,
			"axes" : [ {
				"type" : "numeric",
				"position" : "left",
				"fields" : [ "TOTAL" ],

				"title" : ylabel
			}, {
				"type" : "Category",
				"position" : "bottom",
				"title" : xlabel,
				"fields" : [ "NAME" ],
				label : {
					rotate : {
						degrees : -45
					}
				}
			} ],
			series : [ {
				type : type,
				axis : "left",
				highlight : true,
				xField : "NAME",
				yField : "TOTAL",
				listeners : {
					itemmouseup : function(item) {

						onChartClick(item)
					}
				},
				tips : {
					trackMouse : true,
					width : 140,
					height : 28,
					renderer : function(storeItem, item) {
						this.setTitle(storeItem.get('NAME') + ' => ' + storeItem.get('TOTAL'))
					}
				}
			} ],
			"store" : {
				"remoteFilter" : false,
				"remoteSort" : false,
				"autoLoad" : true,
				"mode" : "local",
				"model" : "chartModel",
				"proxy" : {
					"type" : "ajax",
					"url" : "ADS?action=execscriptbycode&CMD=sql&SCRIPT=EXT_ADMIN_HANDLEEVENTS",
					"reader" : {
						"type" : "json",
						"root" : "values"
					},
					extraParams : params
				}
			}
		} ]
	}
}

function createGaugeChart(width, height, title, sql1, sql2, params, xlabel, ylabel) {
	if (!params) {
		params = {};
	}
	params.sql1 = sql1;
	params.sql2 = sql2;
	return {
		"xtype" : "panel",
		tools : [ {
			type : 'refresh',
			tooltip : 'Refresh Data',
			handler : function(event, toolEl, panelHeader) {
				panelHeader.up("panel").down("chart").getStore().reload()
			}
		} ],
		"layout" : "border",
		"width" : width,
		"height" : height,
		"flex" : 1,
		"title" : title,
		"items" : [ {
			"xtype" : "chart",
			"region" : "center",
			padding : '0',
			"animate" : true,
			"style" : "background:#fff",
			insetPadding : 25,
			"shadow" : true,
			"loadMask" : true,
			"axes" : [ {
				type : 'gauge',
				position : 'gauge',
				minimum : 0,
				maximum : 100,
				steps : 10,
				margin : -5
			} ],
			series : [ {
				type : 'gauge',
				field : 'TOTAL',
				donut : 80,
				colorSet : [ '#F49D10', '#ddd' ],
				renderer : function(sprite, record, attr, index, store) {
					if (attr.fill == this.colorSet[1])
						return Ext.apply(attr, {
							fill : attr.fill
						});
					var value = record.get("SLA"), color;
					if (value >= 90) {
						color = "#ff4000";
					} else if (value > 70) {
						color = "#ffa31a";
					} else {
						color = '#12c897';
					}
					return Ext.apply(attr, {
						fill : color
					});
				}
			} ],
			"store" : {
				"remoteFilter" : false,
				"remoteSort" : false,
				"autoLoad" : true,
				"mode" : "local",
				"model" : "chartModel",
				"proxy" : {
					"type" : "ajax",
					"url" : "ADS?action=execscriptbycode&CMD=gauge&SCRIPT=EXT_ADMIN_HANDLEEVENTS",
					"reader" : {
						"type" : "json",
						"root" : "values"
					},
					extraParams : params
				}
			}
		} ]
	}
}
function loadServers() {
	//	east.mask("loading...");
	exec({
		"CMD" : "getServers"
	}, addServers)
}
function addServers(status, response) {
	//east.unmask()
	east.removeAll()
	var serverInfos = Ext.decode(response);
	var count = 0;
	for ( var x in serverInfos) {
		var server = buildServer(x, serverInfos[x]);

		server.height = 150;
		east.add(server)
		var server = buildServer(x, serverInfos[x]);
		count++;

	}
	east.setTitle("Servers(" + count + ")")

}
function buildServer(ip, info) {

	var data = [];
	data.push("<b>Processors:</b> " + info.processors)
	for ( var d in info.drives) {
		var drive = info.drives[d];
		var freespace = drive.freespace;
		freespace = freespace / (1024 * 1024);
		var unit = "M"
		if (freespace > 1024) {
			freespace = freespace / 1024;
			unit = "G"
		}
		freespace = Math.round(freespace * 100) / 100

		data.push("<b>" + drive.name + "</b> " + drive.percentused + "% Used, " + freespace + " " + unit + " free")
	}

	var items = [ {
		text : "Ram " + info.percentused + "%",
		xtype : "progressbar",
		value : info.percentused / 100
	}, {
		text : "Max Ram " + info.percentusedmax + "%",
		xtype : "progressbar",
		value : info.percentusedmax / 100
	}, {
		xtype : "displayfield",
		value : data.join("<br>")
	} ];
	var panel = {
		"xtype" : "panel",
		tbar : [ ip, '->', {
			text : "Filter",
			ip : ip,
			handler : filterOnServer
		} ],
		width : 190,
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		defaults : {
			margin : 5
		},
		items : items

	}
	return panel;
}

function createCounters() {
	var notiTpl = new Ext.XTemplate('<tpl for=".">', '<div class="thumb-wrap" id="{name:stripTags}">', '<div class="kpi-counter" style="color:{color}">{value}</div>',
			'<div class="kpi-text">{label}</div>', '</div>', '</tpl>');

	var view = Ext.create("Ext.view.View", {

		style : " background: white;",
		defaults : {
			margin : 10
		},
		id : "kpiView",
		border : false,
		height : 65,
		loadMask : false,
		store : {
			remoteFilter : false,
			remoteSort : false,

			autoLoad : true,
			mode : "local",
			fields : [ 'label', {
				name : 'value',
				type : 'float'
			}, 'color', "filter" ],
			proxy : {
				type : "ajax",
				url : "ADS?action=execscriptbycode&CMD=getCounters&SCRIPT=EXT_ADMIN_HANDLEEVENTS",
				reader : {
					type : "json",
					root : "values"
				}

			}
		},
		tpl : notiTpl,
		overItemCls : 'x-item-over',
		itemSelector : 'div.thumb-wrap',
		emptyText : 'No counters available',
		listeners : {
			select : onCounterSelect
		}
	})
	return {
		xtype : "panel",
		layout : "fit",
		region : "north",
		collapsible : true,
		title : "KPI",
		tbar : [ {
			text : "${tr.Refresh Logs}",
			iconCls : 'icon-logs16',
			handler : function() {
				logStore.reload();
			},
			scope : this
		}, {
			text : "${tr.Refresh KPIs}",
			iconCls : 'icon-refresh16',
			handler : refreshKpis,
			scope : this
		}, {
			text : "${tr.Clear Filters}",
			iconCls : 'icon_reset',
			handler : function(btn) {
				clearFilters();

			},
			scope : this
		}, '->', {
			text : "${tr.Delete All Logs}",
			iconCls : 'icon-delete16',
			handler : function(btn) {
				execScriptByCode("EXT_GRBR_HANDLEEVENTS", {
					CMD : "clearLogs"

				}, function(serverstat, response) {
					try {

						handleServerResponse(serverstat, response)
						logStore.loadPage(1)
					} catch (e) {
						showError(e)
					}
				})

			},
			scope : this
		}, {
			enableToggle : true,
			pressed : true,
			text : "Auto Update",
			iconCls : "icon-restore16",
			id : "chk_autoupdate"
		} ],
		height : 115,
		tools : [ {
			type : 'refresh',
			tooltip : 'Refresh Data',
			handler : function(event, toolEl, panelHeader) {
				Ext.getCmp("kpiView").getStore().reload()
			}
		}, {
			type : 'maximize',
			tooltip : 'Maximize',
			handler : function(event, toolEl, panelHeader) {
				window.open("ADS?Template=web/templates/base.htm&VIEW=ADMINDASHBOARD")
			}
		} ],
		region : "north",
		items : [ view ]

	}
}

function LogViewer() {
	this.debugStore = Ext.create('Ext.data.Store', {
		model : 'debugitem',
		remoteSort : false,
		remoteFilter : false
	});

	this.debugGrid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		disableSelection : true,
		forceFit : true,
		selType : "rowmodel",
		sortableColumns : false,
		store : this.debugStore,
		defaults : {
			sortable : false
		},
		columns : [ {
			dataIndex : "LEVEL",
			text : "${tr.Level}",
			width : '20',
			tdCls : 'search_item_grid wrap-text',
			renderer : function(value, metadata, record) {
				var color = "black";
				var img = "icons/icon16/unknown.png"
				if (value == 'DEBUG') {
					img = "icons/icon16/debug.png"
					color = "black";
				} else if (value == 'INFO') {
					img = "icons/icon16/info.png"
					color = "green";
				} else if (value == 'WARN') {
					img = "icons/icon16/warn.png"
					color = "orange";
				} else if (value == 'ERROR') {
					img = "icons/icon16/error.png"
					color = "red";
				}
				//<font color="' + color + '">' + record.get("MESSAGE") + '</font>';
				return '<img src="' + img + '" hspace="3" />'
			}

		}, {
			dataIndex : "RID",
			width : '20',
			text : "${tr.Rule ID}",
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "MESSAGE",
			text : "${tr.Message}",
			width : '90%',
			tdCls : 'search_item_grid wrap-text',
			renderer : function(value, metadata, record) {
				var level = record.get("LEVEL");
				var color = "black";
				if (level == 'INFO') {
					color = "green";
				} else if (level == 'WARN') {
					color = "orange";
				} else if (level == 'ERROR') {
					color = "red";
				}
				return '<font color="' + color + '">' + value + '</font>';

			}

		} ]

	});

	this.win = new Ext.Window({
		closable : true,
		resizable : true,

		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Logs}",
		width : Ext.getBody().getViewSize().width - 100,
		height : Ext.getBody().getViewSize().height - 100,
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.debugGrid ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});

	this.open = function(records) {
		this.win.show();
		//	this.win.maximize()
		this.debugStore.loadData(records);

	}
}
function clearFilters() {
	logStore.clearFilter(true);
	logStore.addFilter([ {
		property : 'AGENCY',
		value : '${se.serviceProviderCode}'
	} ], false);
	logStore.loadPage(1)
}

function filterOnServer(btn) {
	var ip = btn.ip

	logStore.clearFilter(true);
	logStore.addFilter([ {
		property : 'AGENCY',
		value : '${se.serviceProviderCode}'
	}, {
		property : 'SERVER',
		value : ip
	} ], false);
	logStore.loadPage(1)

}
function onCounterSelect(view, record) {
	var name = record.get("NAME");

	var filter = record.get("filter")
	if (filter.indexOf("BRULES") == -1) {
		logStore.clearFilter(true);
		logStore.addFilter([ {
			property : 'AGENCY',
			value : '${se.serviceProviderCode}'
		}, {
			property : 'EXECSTATUS',
			value : filter
		} ], false);
		logStore.loadPage(1)
	} else {
		var btn = filter.replace("BRULES.", "");
		var jsload = "";
		if (btn != "") {
			jsload = "&onLoad=Ext.getCmp('" + btn + "').toggle(true);onContextMenuClick(Ext.getCmp('" + btn + "'))";
		}

		window.open("ADS?Template=web/templates/base.htm&VIEW=BRULES" + jsload)
	}

}
function onChartClick(item) {
	var time = item.storeItem.get("NAME");
	logStore.clearFilter(true);
	var date = new Date();
	date = Ext.Date.format(date, "m/d/Y");
	var fromDate = date + " " + time + ":00";
	var toDate = date + " " + time + ":59";
	var fromFilter = new Ext.util.Filter({
		property : "REC_DATE",
		operator : ">=",
		anyMatch : true,
		value : fromDate
	});

	var toFilter = new Ext.util.Filter({
		property : "REC_DATE",
		operator : "<=",
		value : toDate
	});
	logStore.addFilter([ fromFilter, toFilter, {
		property : 'AGENCY',
		value : '${se.serviceProviderCode}'
	}, {
		property : 'EXECSTATUS',
		value : 'ERROR'
	} ], false);
	logStore.loadPage(1)

}
function refreshKpis() {
	loadServers();
	Ext.getCmp("kpiView").getStore().reload();
	Ext.getCmp("CHART_ERROS").down("chart").getStore().reload();
	Ext.getCmp("CHART_ACTIVE_SESSIONS").down("chart").getStore().reload();
	Ext.getCmp("CHART_USER_GRID").getStore().reload();
}