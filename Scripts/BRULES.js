/*------------------------------------------------------------------------------------------------------/
| Program		: CUSTOM:GLOBALSETTINGS/RULES/BUSINESS RULES/GRBR/BRULES.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 27/11/2016 12:27:43
|eval(getScriptText("EXT_BRE_HANDLEEVENTS"));
|eval(getScriptText("BRULES.ACTIONS"));
|eval(getScriptText("BRULES.DEF"));
|eval(getScriptText("BRULES.CONTROLS"));
|eval(getScriptText("BRULES.BETA"));
|eval(getScriptText("BRULES.INSTRUCTIONS"));
/------------------------------------------------------------------------------------------------------*/

var isRtl = "${DIRECTION}" == "rtl";
var capID = "${capID}";
var required = '<font color="red">*</font>'
var itemSearchStore;
var grid;
var tree;
var recTree;
var orgTree
var historygrid;

var orgStore;
var _recordType = "";
var _ruleFormSimple = null;
var _ruleFormComplex = null
var _ruleForm = null;
var _refactor = null;
var _historyWindow = null;
var _ruleRecType = "";
var _logViewer = null;
var _debugger = null;
var _ruleShare = null;
var _agencyCount = 0;
var _agencies = [];

function ScriptLoader(startFn) {
	_loaderinstance = this;
	this.scripts = [];
	this.idx = 0;
	this.css = [];
	this.startFn = startFn;
	this.includeJS = function(js) {
		this.scripts.push(js)
	}
	this.includeCSS = function(js) {
		this.css.push(js)
	}
	this.load = function() {
		for ( var x in this.css) {
			this.includeFile(this.css[x], "css")
		}
		Ext.MessageBox.show({
			title : 'Please wait',
			msg : 'Loading items...',
			progressText : 'Initializing...',
			width : 300,
			progress : true,
			closable : false

		});
		for ( var x in this.scripts) {
			this.includeFile(this.scripts[x], "js", this.onScriptLoaded)
		}

	}
	this.onScriptLoaded = function() {

		_loaderinstance.idx++;
		if (_loaderinstance.idx < _loaderinstance.scripts.length) {
			var i = _loaderinstance.idx / _loaderinstance.scripts.length
			Ext.MessageBox.updateProgress(i, Math.round(100 * i) + '% completed');

		} else {
			Ext.MessageBox.updateProgress(i, Math.round(100 * i) + '% completed')
			Ext.MessageBox.hide();
			_loaderinstance.startFn();
		}
	}
	this.includeFile = function(filename, filetype, callback) {
		if (filetype == "js") { // if filename is a external JavaScript file
			var fileref = document.createElement('script')
			fileref.setAttribute("type", "text/javascript")
			fileref.setAttribute("src", filename)
		} else if (filetype == "css") { // if filename is an external CSS file
			var fileref = document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", filename)
		}
		if (typeof fileref != "undefined") {
			if (callback) {
				fileref.onload = callback;
			}
			document.getElementsByTagName("head")[0].appendChild(fileref);
		}
	}
}
Ext.onReady(function() {
	document.title = "Accela Business Rules Engine";
	Ext.BLANK_IMAGE_URL = "web/lib/ext-4.2/resources/ext-theme-classic/images/tree/s.gif";

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

	loader.includeJS("web/lib/ext-4.2/examples/ux/form/MultiSelect.js");
	loader.includeJS("web/scripts/asit/asit.definition.js");
	loader.includeJS("ADS?action=getasitscript&ASIT=BRULES.ACTIONS");
	loader.includeJS("ADS?action=getasitscript&ASIT=BRULES.DEF");
	loader.includeJS("ADS?action=getasitscript&ASIT=BRULES.BETA");
	loader.includeJS("ADS?action=getasitscript&ASIT=BRULES.CONTROLS");
	loader.includeJS("ADS?action=getasitscript&ASIT=BRULES.INSTRUCTIONS");
	loader.includeJS("web/lib/FileSaver.js");
	loader.load();

})

function start() {
	Ext.getBody().setStyle("font-size", "")
	itemSearchStore = Ext.create('Ext.data.Store', {
		model : 'bruleitem',
		remoteSort : true,
		remoteFilter : true,
		pageSize : '${se.BRULES_RECPERPAGE}',
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listRules',

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
		} ]

	});

	grid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		disableSelection : false,
		forceFit : true,
		selType : "checkboxmodel",

		features : [ groupingFeature, {
			ftype : "rowwrap"
		} ],
		store : itemSearchStore,
		tbar : [ ' <b>${tr.Record Type:}</b> <span id="RECTYPE_SPAN"></span>', '->', {
			xtype : 'triggerfield',
			triggerCls : 'x-form-clear-trigger',
			trigger2Cls : 'x-form-search-trigger',
			emptyText : '${tr.ACA_TopPage_ButtonTips_Search} ...',
			id : "txt_search",
			allowBlank : true,
			selectOnFocus : true,
			width : 200,
			search : function() {
				var filterID = "RNAME";
				var criteria = this.getValue();
				var grid = this.up("grid");
				grid.store.filters.removeAtKey(filterID);
				if (criteria.length > 0) {
					var filter = {
						id : filterID,
						property : filterID,
						value : criteria + "%"
					};
					grid.store.addFilter(filter, false)
				}
				grid.store.loadPage(1);
			},
			onTriggerClick : function() {
				this.setValue('')
				this.search();
			},
			onTrigger2Click : function() {
				this.search();
			},
			enableKeyEvents : true,
			listeners : {
				keydown : function(field, e, eOpts) {
					if (e.keyCode == 13) {
						this.search();
					}
				}
			}
		} ],
		defaults : {
			sortable : true
		},
		columns : [ {
			xtype : 'actioncolumn',

			width : 60,
			renderer : function(value, metadata, record) {
				var value = record.get("VALIDATION")
				var returnHtml = "";
				var img = "icons/icon16/unknown.png"
				if (value == 'VALID') {
					img = "icons/icon16/success.png"
				} else if (value != "") {
					img = "icons/icon16/warn.png"
				}
				grid.columns[0].items[0].icon = img;
				var lock = record.get("RLOCK");
				if (lock) {

					grid.columns[0].items[1].icon = "icons/icon16/lock.png";
					grid.columns[0].items[1].tooltip = "locked by " + lock
				} else {
					grid.columns[0].items[1].icon = "";
					grid.columns[0].items[1].tooltip = ""

				}

			},
			items : [ {
				handler : function(grid, rowIndex, colIndex) {
					var rec = grid.getStore().getAt(rowIndex);
					var value = rec.get("VALIDATION");
					if (value == 'VALID') {
						showInfo("Rule is Valid")
					} else if (value != "") {
						Ext.MessageBox.show({
							title : 'Rule Validation Problems',
							msg : value,
							width : 800,
							buttons : Ext.MessageBox.OK,
							icon : Ext.MessageBox.WARNING
						});
					}

				},
				getClass : function(v, meta, rec) {
					if (rec.data.VALIDATION == "VALID") {
						return 'x-hide-display';
					}
				}
			}, {
				handler : function(grid, rowIndex, colIndex) {

				},
				getClass : function(v, meta, rec) {
					if (rec.data.RLOCK == "") {
						return 'x-hide-display';
					}
				}
			} ]
		}, {
			text : "${tr.Order}",
			width : '60',
			hidden : false,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'RORDER'
		}, {
			text : "${tr.ID}",
			width : '60',
			hidden : true,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'ID'
		}, {
			text : "${tr.Name}",
			width : '20%',
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'RNAME'
		}, {
			text : "${tr.Event}",
			width : '20%',
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'REVENT',
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
			text : "${tr.Record Type}",
			width : '40%',
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'RMODULE',
			renderer : function(value, metadata, record) {
				var module = record.get("RMODULE")
				if (!module) {
					module = "*"
				}
				var type = record.get("RTYPE")
				if (!type) {
					type = "*"
				}

				var subtype = record.get("RSUBTYPE")
				if (!subtype) {
					subtype = "*"
				}
				var cat = record.get("RCATEGORY")
				if (!cat) {
					cat = "*"
				}
				return module + "/" + type + "/" + subtype + "/" + cat;
			}
		}, {
			text : "${tr.Agencies}",
			width : '40%',
			hidden : true,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'AGENCIES',
			renderer : function(value, metadata, record) {
				var arr = value.split(",")

				try {
					var values = [];
					for ( var x in arr) {
						var acode = arr[x]
						var rec = agencyStore.getRootNode().findChild("value", acode, true);
						if (rec) {
							values.push(rec.data.text);
						}

					}
					value = values.join(",")
				} catch (e) {
					console.log(e)
				}
				return value;
			}
		}, {
			text : "${tr.User}",
			width : '20%',
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'REC_USER'
		}, {
			xtype : "datecolumn",
			format : "d/m/Y H:i:s",
			text : "${tr.Date}",
			width : '20%',
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'REC_DATE'
		}, {
			hidden : true,
			text : "${tr.Version}",
			width : 100,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'VERSION'
		} ],
		listeners : {
			celldblclick : function(searchGrid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				openRule(record)
			},
			itemcontextmenu : function(view, record, item, index, e) {
				e.stopEvent();
				var menuItems = [ {
					text : '${tr.Open}',
					iconCls : 'icon-open16',
					id_aa : 'open',
					scope : this,
					handler : onContextMenuClick
				}, {
					text : '${tr.Run}',
					id_aa : 'run',
					handler : onContextMenuClick,
					iconCls : 'icon-play16'
				}, {
					text : '${tr.Check Validity}',
					iconCls : 'icon-validate16',
					id_aa : 'check',
					scope : this,
					handler : onContextMenuClick
				}, {
					text : '${tr.History}',
					iconCls : 'icon-versions16',
					id_aa : 'rulehistory',
					scope : this,
					handler : onContextMenuClick
				}, '-', {

					text : '${tr.Find Similar}',
					iconCls : 'icon_child',
					scope : this,
					id_aa : 'findsimilar',
					handler : onContextMenuClick

				}, {

					text : '${tr.dataManager.datagrid.refresh.label}',
					iconCls : 'icon-refresh16',
					scope : this,
					id_aa : 'refresh',
					handler : onContextMenuClick

				} ];

				for ( var x in menuItems) {
					menuItems[x].record = record;
				}
				var rowMenu = Ext.create('Ext.menu.Menu', {
					items : menuItems
				});
				rowMenu.showAt(e.getXY());
			}
		},
		// paging bar on the bottom
		bbar : Ext.create('Ext.PagingToolbar', {
			store : itemSearchStore,
			pageSize : itemSearchStore.pageSize,
			displayInfo : true,
			displayMsg : '{0} - {1} of {2}',
			emptyMsg : "No Rules to display",
			plugins : [ new Ext.ux.ProgressBarPager(), new Ext.ux.grid.PageSize({
				beforeText : "Rows",
				afterText : ""
			}) ]
		})

	});

	recTree = Ext.create('Ext.ux.TreeFilter', {
		title : "${tr.Record Types}",
		rootVisible : false,

		store : new Ext.create('Ext.data.TreeStore', {
			model : 'RecModel',
			autoLoad : true,

			proxy : {
				type : 'ajax',
				url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=loadRecordTypes',
				reader : {
					type : 'json',
					root : 'children'
				}
			},
			listeners : {
				beforeload : function(store, operation, eOpts) {
					operation.params = {
						"AGENCIES" : _agencies.join(",")
					}
				}
			},
			root : {
				expanded : true
			}

		}),
		listeners : {
			itemclick : onRecordTypeClick
		},
		region : "center"
	});
	agencyStore = new Ext.create('Ext.data.TreeStore', {
		model : 'AgencyModel',
		autoLoad : true,
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listAgencies',
			reader : {
				type : 'json',
				root : 'children'
			}
		},
		listeners : {
			load : function(store, node, records, successful, eOpts) {
				_agencyCount = 0;
				agenciesLoad(node)
				if (_agencyCount <= 1) {
					Ext.getCmp("tlb_share").disable();
					Ext.getCmp('tlb_filter_agency').disable();
					Ext.getCmp('tab_org_tree').close()
				}
			}
		},
		root : {
			expanded : true
		}
	});

	orgTree = Ext.create('Ext.ux.TreeFilter', {
		title : "${tr.Agencies}",
		rootVisible : false,
		hidden : false,
		id : "tab_org_tree",
		store : agencyStore,
		viewConfig : {
			plugins : {

				ptype : 'treeviewdragdrop'

			},
			listeners : {
				drop : function(node, data, overModel, dropPosition, eOpts) {
					var parent = "";
					if (dropPosition == "before" || dropPosition == "after") {
						parent = overModel.parentNode.data.value;
					} else {
						parent = overModel.data.value;
					}
					var params = {
						CMD : 'updateAgencyParent',
						AGENCY : data.records[0].data.value,
						PARENT : parent
					}
					execScriptByCode("EXT_BRE_HANDLEEVENTS", params, function() {
						//orgTree.getStore().reload()
					})
				},
				nodedragover : function(targetNode, position, dragData) {
					return true;
				}
			}

		},
		listeners : {

			beforeselect : function(tree, record, index, eOpts) {
				return record.data.admin
			},
			//select : selectTreeNodes,
			//deselect : deselectTreeNodes,
			selectionchange : onAgencyChange
		},
		selModel : {
			selType : 'checkboxmodel',
			mode : 'MULTI'
		}

	});

	var leftPanel = Ext.create('Ext.tab.Panel', {
		id : "properties_panel",
		region : 'west',
		collapseMode : "mini",
		collapsible : false,
		split : true,

		width : 300,
		layout : 'border',
		items : [ recTree, orgTree ]
	})
	var toolbarPanel = Ext.create('Ext.panel.Panel', {
		region : 'north',
		collapsible : true,
		split : true,
		collapseMode : "mini",
		height : 100,
		bbar : [ {
			xtype : 'buttongroup',
			columns : 6,
			title : '${tr.Rule}',
			defaults : {
				handler : onContextMenuClick
			},
			items : [ {
				text : "${tr.Add New}",
				id_aa : 'add',
				scale : 'large',
				rowspan : 3,
				aa_mode : "simple",
				xtype : 'splitbutton',
				iconCls : 'icon-new32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow',
				menu : [ {
					text : "${tr.Advanced}",
					id_aa : 'add',
					aa_mode : "complex",
					handler : onContextMenuClick,
					iconCls : 'icon-new16',
					cls : 'x-btn-as-arrow'
				} ]
			}, {
				text : "${tr.Open}",
				id_aa : 'open',
				scale : 'large',
				rowspan : 3,
				iconCls : 'icon-open32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Share}',
				id : "tlb_share",
				id_aa : 'share',
				cls : 'x-btn-as-arrow',
				iconAlign : 'top',
				scale : 'large',
				rowspan : 3,
				iconCls : 'icon-share32'
			}, {
				text : '${tr.Import}',
				scale : 'large',
				id_aa : 'import',
				rowspan : 3,
				iconCls : 'icon-import32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Export}',
				scale : 'large',
				id_aa : 'export',
				rowspan : 3,
				iconCls : 'icon-export32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				id : "btn_main_delete",
				text : '${tr.Delete}',
				id_aa : 'delete',
				iconCls : 'icon-delete16'
			}, {
				id : "btn_main_restore",
				text : '${tr.Restore}',
				disabled : true,
				id_aa : 'restore',
				iconCls : 'icon-restore16'
			}, {
				text : '${tr.Recycle Bin}',
				id : "tlb_recycle",
				id_aa : 'recycle',
				enableToggle : true,
				pressed : false,
				iconCls : 'icon-recycle16'
			} ]
		}, {
			xtype : 'buttongroup',
			columns : 2,
			defaults : {
				handler : onContextMenuClick
			},
			title : '${tr.Revisions}',
			items : [ {
				text : '${tr.History}',
				scale : 'large',
				id_aa : 'history',
				rowspan : 3,
				iconCls : 'icon-versions32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Tag}',
				id : "tlb_tag",
				id_aa : 'tag',
				iconCls : 'icon-tag16'
			}, {

				text : '${tr.Restore}',
				id : "tlb_restoretag",
				id_aa : 'restoretag',
				iconCls : 'icon-restore16'
			}, {
				text : '${tr.Rule History}',
				id_aa : 'rulehistory',
				iconCls : 'icon-versions16'
			} ]
		}, {
			xtype : 'buttongroup',
			columns : 4,
			defaults : {
				handler : onContextMenuClick
			},
			title : '${tr.Data Filters}',
			items : [ {
				text : '${tr.Clear}',
				scale : 'large',
				id_aa : 'clearfilters',
				rowspan : 3,
				iconCls : 'icon-filter32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Refresh}',
				scale : 'large',
				id_aa : 'refresh',
				rowspan : 3,
				iconCls : 'icon-refresh32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Record Type}',
				id : "tlb_filter_recordtype",
				id_aa : 'filter_recordtype',
				enableToggle : true,
				pressed : true,
				iconCls : ''
			}, {
				text : '${tr.Agency}',
				id : "tlb_filter_agency",
				id_aa : 'filter_agency',
				enableToggle : true,

				pressed : true,
				iconCls : ''
			}, {
				text : '${tr.Error Only}',
				id : "filter_error",
				id_aa : 'filter_error',
				enableToggle : true,
				pressed : false,
				iconCls : ''
			}, {
				text : '${tr.My Rules}',
				id_aa : 'filter_myrules',
				enableToggle : true,
				pressed : false,
				iconCls : ''
			}, {
				text : '${tr.Today}',
				id_aa : 'filter_today',
				enableToggle : true,
				pressed : false,
				iconCls : ''
			} ]
		}, {
			xtype : 'buttongroup',
			columns : 3,
			defaults : {
				handler : onContextMenuClick
			},
			title : '${tr.Validation & Execution}',
			items : [ {
				text : '${tr.Refactor}',
				scale : 'large',
				id_aa : 'refactor',

				rowspan : 3,
				iconCls : 'icon-refactor32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Validate}',
				scale : 'large',
				id_aa : 'check',
				id : "tlb_validate",
				rowspan : 3,
				iconCls : 'icon-validate32',
				iconAlign : 'top',
				cls : 'x-btn-as-arrow'
			}, {
				text : '${tr.Validate All}',
				id_aa : 'checkall',
				id : "tlb_validate_all",
				iconCls : 'icon-validate16'
			}, {
				text : '${tr.Execution Logs}',
				id_aa : 'showlogs',
				iconCls : 'icon-logs16'
			}, {
				text : '${tr.Run}',
				id_aa : 'run',
				iconCls : 'icon-play16'
			} ]
		}, '->', {
			xtype : 'buttongroup',
			columns : 1,
			title : '${tr.Tools}',
			defaults : {
				handler : onContextMenuClick
			},
			items : [ {
				text : '${tr.Help}',
				id_aa : 'help',
				iconCls : 'icon-help16'
			}, {
				text : '${tr.Pop out}',
				id_aa : 'maximize',
				disabled : window.top.location.href == window.location.href,
				iconCls : 'icon-maximize16'
			}, {
				text : '${tr.Refresh}',
				id_aa : 'refreshpage',
				iconCls : 'icon-refresh16'
			} ]
		} ]

	})
	Ext.create('Ext.container.Viewport', {
		layout : 'border',
		rtl : isRtl,
		items : [ toolbarPanel, leftPanel, grid ]

	});
	itemSearchStore.addFilter({
		id : "REC_STATUS",
		property : "REC_STATUS",
		value : "A"
	}, false)

	setRecordType("")
	orgTree.show()
	recTree.show()

	var qs = getQueryStrings();
	var onLoad = qs["onLoad"];
	if (onLoad) {
		try {
			eval(onLoad)
		} catch (e) {
			console.error(e)
		}

	} else {
		itemSearchStore.load();
	}
}