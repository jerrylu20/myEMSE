/*------------------------------------------------------------------------------------------------------/
| Program		: CUSTOM:GLOBALSETTINGS/RULES/BUSINESS RULES/GRBR/BRULES.DEF.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 29/11/2016 19:37:37
|
/------------------------------------------------------------------------------------------------------*/

var groupingFeature = {
	id : 'group',
	ftype : 'grouping',
	groupHeaderTpl : '{columnName} : {name} ({rows.length})',
	hideGroupedHeader : false,
	enableGroupingMenu : true
};
Ext.namespace("Ext.ux");
Ext.ux.comboBoxRenderer = function(combo) {
	return function(value) {
		try {
			combo.store.clearFilter(false);
			var idx = combo.store.find(combo.valueField, value);
			var rec = combo.store.getAt(idx);
			return rec.get(combo.displayField);
		} catch (e) {
			return value;
		}

	};
}

Ext.define('Ext.ux.TreeFilter', {
	extend : 'Ext.tree.Panel',
	alias : 'aatree',
	tbar : [ {
		xtype : 'triggerfield',
		triggerCls : 'x-form-clear-trigger',

		emptyText : '${tr.ACA_TopPage_ButtonTips_Search} ...',

		allowBlank : true,
		selectOnFocus : true,

		search : function() {
			var p = this.up("panel");
			if (this.getValue() == "") {
				p.collapseAll()
			} else {
				p.expandAll()
			}

			p.filterByText(this.getValue())
		},
		onTriggerClick : function() {
			this.setValue('')
			this.search();
		},

		enableKeyEvents : true,
		listeners : {
			render : function() {
				var me = this;
				me.ownerCt.on('resize', function() {
					me.setWidth(this.getEl().getWidth() - 5)
				})
			},
			change : function() {
				this.search();
			},
			keydown : function(field, e, eOpts) {
				if (e.keyCode == 13) {
					this.search();
				}
			}
		}
	} ],
	loadMask : true,
	filterByText : function(text) {
		this.filterBy(text, 'text');
	},

	/**
	 * Filter the tree on a string, hiding all nodes expect those which match and their parents.
	 * @param The term to filter on.
	 * @param The field to filter on (i.e. 'text').
	 */
	filterBy : function(text, by) {

		this.clearFilter();

		var view = this.getView(), me = this, nodesAndParents = [];

		// Find the nodes which match the search term, expand them.
		// Then add them and their parents to nodesAndParents.
		this.getRootNode().cascadeBy(function(tree, view) {
			var currNode = this;

			if (currNode && currNode.data[by] && currNode.data[by].toString().toLowerCase().indexOf(text.toLowerCase()) > -1) {
				me.expandPath(currNode.getPath());

				while (currNode.parentNode) {
					nodesAndParents.push(currNode.id);
					currNode = currNode.parentNode;
				}
			}
		}, null, [ me, view ]);

		// Hide all of the nodes which aren't in nodesAndParents
		this.getRootNode().cascadeBy(function(tree, view) {
			var uiNode = view.getNodeByRecord(this);

			if (uiNode && !Ext.Array.contains(nodesAndParents, this.id)) {
				Ext.get(uiNode).setDisplayed('none');
			}
		}, null, [ me, view ]);
	},

	clearFilter : function() {
		var view = this.getView();

		this.getRootNode().cascadeBy(function(tree, view) {
			var uiNode = view.getNodeByRecord(this);

			if (uiNode) {
				Ext.get(uiNode).setDisplayed('table-row');
			}
		}, null, [ this, view ]);
	}
});
Ext.define('CTXLib', {
	extend : 'Ext.data.Model',
	idProperty : 'id',
	fields : [ "id", "text", "value", "type", 'leaf', 'icon', "help" ]
});
Ext.define('CTXModel', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'text',
		type : 'string'
	}, {
		name : 'value',
		type : 'string'
	} ],

	hasMany : {
		model : 'children',
		name : 'children'
	},
	belongsTo : 'children'
});

Ext.define('debugitem', {
	extend : 'Ext.data.Model',
	fields : [ 'LEVEL', 'RID', 'MESSAGE' ]
});
Ext.define('logitem', {
	extend : 'Ext.data.Model',
	fields : [ 'ID', 'CAPID', 'EVENT', 'REC_USER', 'REC_DATE', 'AGENCY', 'EXECLOG', 'EXECSTATUS', 'EXECTIME' ]
});
Ext.define('bruleitem', {
	extend : 'Ext.data.Model',
	fields : [ 'ID', 'MODE', 'RNAME', 'RDESCRIPTION', 'REVENT', 'PID', 'RMODULE', 'RTYPE', 'RSUBTYPE', 'RCATEGORY', 'RLOCK', 'RORDER', 'REC_STATUS', 'VERSION', 'REC_USER',
			'RDATA', 'RSCRIPT', 'REC_DATE', "AGENCIES", "TAG", "VALIDATION", "RSCOPE", "RAUDIENCE", "RMODE" ]
});
Ext.define('RecModel', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'text',
		type : 'string'
	}, {
		name : 'value',
		type : 'string'
	} ],

	hasMany : {
		model : 'children',
		name : 'children'
	},
	belongsTo : 'children'
});
Ext.define('AgencyModel', {
	extend : 'Ext.data.Model',
	fields : [ {
		name : 'text',
		type : 'string'
	}, {
		name : 'value',
		type : 'string'
	}, {
		name : 'current',
		type : 'boolean'
	}, {
		name : 'admin',
		type : 'boolean'
	}, {
		name : 'allowDrag',
		type : 'boolean'
	} ],

	hasMany : {
		model : 'children',
		name : 'children'
	},
	belongsTo : 'children'
});
Ext.define('keyvaluemodel', {
	extend : 'Ext.data.Model',
	fields : [ "aaid", "editable", "name", "value" ]
})

function Rule() {
	Ext.define('conditionitem', {
		extend : 'Ext.data.Model',
		fields : [ 'PREFIX', 'FIELD', 'INTRAOPERATOR', 'VALUE', 'SUFFIX', 'OPERATOR' ]
	});
	Ext.define('actionitem', {
		extend : 'Ext.data.Model',
		fields : [ 'ORDER', 'ACTION', 'ACTIONID', 'ACTIONLABEL', 'CONDITION', 'PARAMS' ]
	});
	this.conditionsStore = Ext.create('Ext.data.JsonStore', {
		model : 'conditionitem'
	});
	this.actionsStore = Ext.create('Ext.data.JsonStore', {
		model : 'actionitem',
		sorters : [ {
			property : 'ORDER',
			direction : 'ASC'
		} ],
		groupers : [ {
			property : 'CONDITION'

		} ]
	});
	this.onActionCellClick = function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {

		var actionID = record.get("ACTION");

		if (actionID != null && actionID != "" && (this.configPanel.record != record || actionID != this.configPanel.actionID)) {
			var combo = this.actionsDefinitionEditor;
			combo.store.clearFilter(false);
			var idx = combo.store.find(combo.valueField, actionID);
			var rec = combo.store.getAt(idx);
			var actionlabel = rec.get(combo.displayField);

			this.configPanel.record = record;
			this.configPanel.actionID = actionID;
			this.configPanel.setTitle("Properties: " + actionlabel)
			this.configPanel.setSource(null, null);
			this.configPanel.doLayout();
			this.configPanel.getEl().mask("Loading...")
			Ext.Ajax.request({
				url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=getActionParams',
				params : {
					ID : actionID
				},
				success : function(response) {
					var configPanel = Ext.getCmp("config_panel");
					configPanel.getEl().unmask();
					try {
						var configObj = Ext.decode(response.responseText)[0];
						var cfg = configObj.config;
						for ( var x in cfg) {
							var field = cfg[x];
							if (field.editor && field.editor.xtype == "combo") {
								field.editor.store.listeners = {};
								field.editor.store.listeners.beforeload = function(store, operation, eOpts) {
									operation.params = {
										"RECTYPE" : _ruleForm.getRecordType()
									}
								}
							}
						}
						var source = configObj.source;
						var params = configPanel.record.get("PARAMS");
						if (params != null && params != "") {
							source = Ext.decode(params);
						}
						configPanel.setSource(source, cfg);

					} catch (e) {
						console.log(e)
					}

				},
				failure : function() {
					Ext.getCmp("config_panel").getEl().unmask()
					showError("failed")
				}
			});

		}
	}
	this.createCombo = function(url, allowBlank) {
		return {
			allowBlank : allowBlank,
			readOnly : false,
			typeAhead : true,
			triggerAction : "all",
			forceSelection : true,
			xtype : "combo",
			queryMode : 'local',
			displayField : 'text',
			valueField : 'value',
			store : new Ext.data.JsonStore({
				remoteFilter : false,
				remoteSort : false,
				autoLoad : true,
				mode : 'local',
				proxy : {
					type : 'ajax',
					url : url,
					//url : 'ADS?action=getstd&STD=' + std,
					reader : {
						type : 'json',
						root : 'values'
					}
				},
				model : 'STDChoice'
			})
		}
	}
	this.configPanel = Ext.create('Ext.grid.property.Grid', {
		title : 'Properties',
		width : 400,
		region : "east",
		resizable : false,
		sortableColumns : false,
		id : "config_panel",

		listeners : {
			beforerender : function(grid) {

				grid.columns[1].renderer = function(value, metaData, record, rowIndex, colIndex, store, view) {
					try {
						if (value.length > 40) {
							value = value.substring(0, 40) + "..."
						}
					} catch (e) {
						console.log(e)
					}

					return value
				}
			},
			propertychange : function(source, recordId, value, oldValue, eOpts) {
				var p = this.configPanel;
				var data = Ext.encode(p.getSource());
				p.record.set("PARAMS", data);
			},
			scope : this
		},
		source : {}
	});
	this.conditionGridcellEditing = new Ext.grid.plugin.CellEditing({
		clicksToEdit : 1

	});
	this.conditionsGrid = Ext.create('Ext.grid.Panel', {
		tbar : [ {
			text : '${tr.Add}',
			id : "btn_addcondition",
			aa_id : "addCondition",
			iconCls : 'icon-new16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}

		}, {
			text : '${tr.Delete}',
			id : "btn_deletecondition",
			aa_id : "deleteselected",
			iconCls : 'icon-delete16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}

		}, '->', "<b>${tr.Conditions}</b>" ],
		loadMask : true,
		forceFit : true,
		sortableColumns : false,
		selType : "checkboxmodel",
		region : "center",
		store : this.conditionsStore,
		plugins : this.conditionGridcellEditing,
		columns : [ {
			text : "${tr.Prefix}",
			tdCls : 'search_item_grid wrap-text',
			width : 40,
			dataIndex : 'PREFIX',
			editor : {
				xtype : "textfield"
			}

		}, {
			text : "${tr.Field}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'FIELD',
			editor : {
				xtype : "expfield"

			}
		}, {
			text : "${tr.Intra Operator}",
			tdCls : 'search_item_grid wrap-text',
			width : 40,
			dataIndex : 'INTRAOPERATOR',
			editor : this.createCombo('ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=getstd&STD=SD_BRULE_INTRAOPERATOR', true)
		}, {
			text : "${tr.Value}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'VALUE',
			editor : {
				xtype : "expfield"

			}
		}, {
			text : "${tr.Suffix}",
			tdCls : 'search_item_grid wrap-text',
			width : 40,
			dataIndex : 'SUFFIX',
			editor : {
				xtype : "textfield"
			}
		}, {
			text : "${tr.Operator}",
			tdCls : 'search_item_grid wrap-text',
			width : 40,
			dataIndex : 'OPERATOR',
			editor : this.createCombo('ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=getstd&STD=SD_BRULE_OPERATOR', true)
		} ]
	});
	this.actionGridcellEditing = new Ext.grid.plugin.CellEditing({
		clicksToEdit : 1

	});

	this.actionGridcellEditing.on('edit', function(e, eOpts) {
		var colName = eOpts.field;
		var rowIdx = eOpts.rowIdx;
		var record = eOpts.record;
		var value = eOpts.value;
		var originalValue = eOpts.originalValue;
		if (colName == "ORDER") {
			this.actionsStore.sort()
		}
		if (colName == "ACTION" && originalValue != value) {
			record.set("PARAMS", "")
		}
		this.onActionCellClick(this.actionsGrid, null, -1, record, null, rowIdx, e, eOpts)

	}, this);
	this.actionsDefinitionEditor = {
		allowBlank : false,
		readOnly : false,
		typeAhead : true,
		triggerAction : "all",
		forceSelection : true,
		xtype : "combo",
		queryMode : 'local',
		displayField : 'text',
		valueField : 'value',
		store : new Ext.data.JsonStore({
			remoteFilter : false,
			remoteSort : false,
			autoLoad : true,
			mode : 'local',
			proxy : {
				type : 'ajax',
				url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listActions',
				reader : {
					type : 'json',
					root : 'values'
				}
			},
			listeners : {
				load : function() {
					this.loadActions()
				},
				scope : this
			},
			model : 'STDChoice'
		})
	}
	this.actionsGrid = Ext.create('Ext.grid.Panel', {
		tbar : [ {
			text : '${tr.Add Then Action}',
			id : "btn_addthenaction",
			aa_id : "addAction",
			aa_scope : true,
			iconCls : 'icon-new16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}
		}, {
			text : '${tr.Add Else Action}',
			id : "btn_addelseaction",
			aa_id : "addAction",
			aa_scope : false,
			iconCls : 'icon-new16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}
		}, {
			text : '${tr.Delete}',
			id : "btn_deleteaction",
			aa_id : "deleteselected",
			iconCls : 'icon-delete16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}

		}, '->', "<b>${tr.Actions}</b>" ],

		plugins : this.actionGridcellEditing,
		loadMask : true,
		forceFit : true,
		sortableColumns : true,
		selType : "checkboxmodel",
		region : "center",
		features : [ groupingFeature, {
			ftype : "rowwrap"
		} ],
		store : this.actionsStore,
		columns : [ {
			text : "${tr.Condition}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'CONDITION',
			width : 20,
			hidden : true

		}, {
			text : "${tr.Order}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'ORDER',
			width : 20,
			editor : {
				xtype : "numberfield"
			}
		}, {
			text : "${tr.Action}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'ACTION',
			editor : this.actionsDefinitionEditor,
			renderer : Ext.ux.comboBoxRenderer(this.actionsDefinitionEditor)

		}, {
			text : "${tr.Label}",
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'ACTIONLABEL',

			editor : {
				xtype : "textfield"
			}
		}
		//,{
		//			text : "${tr.Stop On Error}",
		//			xtype : "checkcolumn",
		//			tdCls : 'search_item_grid wrap-text',
		//			width : 30,
		//			dataIndex : 'STOPONERROR',
		//			editor : {
		//				xtype : "checkboxfield"
		//			}
		//		}, {
		//			text : "${tr.Cancel Event}",
		//			xtype : "checkcolumn",
		//			tdCls : 'search_item_grid wrap-text',
		//			width : 30,
		//			dataIndex : 'CANCELONERROR',
		//			editor : {
		//				xtype : "checkboxfield"
		//			}
		//		} 
		],
		listeners : {

			cellclick : this.onActionCellClick,
			scope : this
		}
	});
	/*this.actionGridcellEditing.on('edit', function(e, eOpts) {
		var colName = eOpts.field;
		var rowIdx = eOpts.rowIdx;
		var record = eOpts.record;
		var value = eOpts.value;
		

	}, this);*/
	this.actionsSection = Ext.create('Ext.form.Panel', {
		region : "south",
		layout : "border",
		height : 250,
		items : [ this.actionsGrid, this.configPanel ]
	});
	this.selectedAgencies = [];
	this.pageFlowStore = new Ext.create('Ext.data.TreeStore', {
		model : 'AgencyModel',
		autoLoad : false,
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=getPageFlow',
			reader : {
				type : 'json',
				root : 'children'
			}
		},
		listeners : {
			beforeload : function(store, operation) {
				store.RECTYPE = _ruleForm != null ? _ruleForm.getRecordType() : "";
				if (_ruleForm && _ruleForm.getAgencies().length > 0) {
					store.AGENCY = _ruleForm.getAgencies()[0];
				}
				operation.params = {
					RECTYPE : store.RECTYPE,
					AGENCY : store.AGENCY
				}
			}
		},
		root : {
			expanded : true,
			text : "PageFlow"
		},
		folderSort : true
	});

	this.form = Ext.create('Ext.form.Panel', {
		region : "north",
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		border : false,
		bodyPadding : 10,

		fieldDefaults : {
			labelWidth : 70,
			readOnly : true,
			margins : '0 0 0 5',
			xtype : 'textfield',
			afterLabelTextTpl : "<font color='red'>*</font>",
			labelStyle : 'font-weight:bold',
			fieldStyle : 'background-color: #ddd; background-image: none;'
		},
		items : [ {
			xtype : 'fieldcontainer',
			layout : 'hbox',
			defaultType : 'textfield',
			items : [ {
				flex : 2,
				fieldLabel : '${tr.Name}',
				name : 'RNAME',
				fieldStyle : "",
				allowBlank : false,
				readOnly : false

			}, {

				name : 'RORDER',
				xtype : 'numberfield',
				fieldStyle : "",
				width : 40,
				allowBlank : false,
				readOnly : false

			} ]
		}, {
			xtype : 'fieldcontainer',
			layout : 'hbox',
			defaultType : 'textfield',
			items : [ {
				flex : 1,
				fieldLabel : '${tr.Audience}',
				name : 'RAUDIENCE',
				fieldStyle : "",
				allowBlank : false,
				readOnly : false,
				typeAhead : true,
				triggerAction : "all",
				forceSelection : true,
				xtype : "combo",
				queryMode : 'local',
				displayField : 'text',
				valueField : 'value',

				store : new Ext.data.Store({
					remoteFilter : false,
					remoteSort : false,
					autoLoad : true,
					mode : 'local',
					data : [ {
						text : "Both",
						value : "BOTH"
					}, {
						text : "Public",
						value : "PUBLIC"
					}, {
						text : "Agency",
						value : "AGENCY"
					} ],

					model : 'STDChoice'
				})

			}, {
				flex : 2,
				fieldLabel : '${tr.Event}',
				name : 'REVENT',
				labelWidth : 50,
				fieldStyle : "",
				allowBlank : false,
				readOnly : false,
				typeAhead : true,
				triggerAction : "all",
				forceSelection : true,
				xtype : "combo",
				queryMode : 'local',
				displayField : 'text',
				valueField : 'value',
				listeners : {
					change : function(cmb, newValue, oldValue, eOpts) {
						var scopeField = this.form.getForm().findField("RSCOPE");
						var catField = this.form.getForm().findField("RCATEGORY");

						if (newValue == "pageflow") {

							if (this.win.RECORD.get("RCATEGORY") != null && this.win.RECORD.get("RCATEGORY") != "") {
								scopeField.show();
							} else {
								showError("you cannot select page flow unless you have selected a full record path")
								cmb.setValue("")
							}
						} else {
							scopeField.hide()
						}

					},
					scope : this
				},
				store : new Ext.data.JsonStore({
					remoteFilter : false,
					remoteSort : false,
					autoLoad : true,
					mode : 'local',
					proxy : {
						type : 'ajax',
						url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listEvents',

						reader : {
							type : 'json',
							root : 'values'
						}
					},
					listeners : {
						load : function() {
							try {
								this.form.getForm().loadRecord(this.form.getForm().getRecord());
							} catch (e) {
								//console.log(e)
							}

						},
						scope : this
					},
					model : 'STDChoice'
				})

			}, Ext.create('Ext.ux.TreeCombo', {
				fieldLabel : '${tr.Scope}',
				labelWidth : 50,
				store : this.pageFlowStore,
				name : "RSCOPE",
				flex : 3,
				listeners : {
					render : function(c) {
						c.getEl().down("input").dom.setAttribute("readOnly", true)

					}
				},
				hidden : true,
				selectChildren : false,
				readOnly : false,
				matchFieldWidth : true,
				displayField : 'text',
				valueField : 'value',
				canSelectFolders : false
			}) ]
		}, {
			xtype : 'fieldcontainer',
			layout : 'hbox',
			defaultType : 'textfield',
			hidden : true,
			items : [ {
				flex : 1,
				fieldLabel : '${tr.Type}',
				name : 'RMODULE'
			}, {
				//fieldLabel : '${tr.Description}',
				name : 'RDESCRIPTION',
				hidden : true
			}, {
				//fieldLabel : '${tr.Lock}',
				name : 'RLOCK',
				hidden : true
			}, {
				flex : 1,
				//fieldLabel : '${tr.Type}',
				name : 'RTYPE'
			}, {
				flex : 1,
				//	fieldLabel : '${tr.Sub Type}',
				name : 'RSUBTYPE'
			}, {
				flex : 1,
				//fieldLabel : '${tr.Category}',
				name : 'RCATEGORY'
			} ]
		} ]
	});
	this.loadActions = function() {
		this.actionsGrid.getStore().removeAll();
		var record = this.win.RECORD;
		var data = record.get("RDATA");
		if (data) {
			data = Ext.decode(data);
			var arrActions = data.RACTIONS;
			if (arrActions != null) {

				for ( var x in arrActions) {
					rec = Ext.create('actionitem', arrActions[x]);
					this.actionsStore.insert(x, rec);
				}
			}

		}
		this.actionsStore.sort()

	}
	this.selectAgencies = function(node) {
		try {

			var arrA = this.win.RECORD.data.AGENCIES.split(",");
			node.eachChild(function(n) {
				if (Ext.Array.indexOf(arrA, n.data.value) >= 0) {
					this.agencyTree.getSelectionModel().select(n, true)
				}
				this.selectAgencies(n)
			}, this)

		} catch (e) {
			//console.log(e)
		}

	}
	this.agencyTree = Ext.create('Ext.ux.TreeFilter', {
		title : "${tr.Agencies}: All",
		width : 400,
		rootVisible : false,
		hidden : _agencyCount == 1,
		store : agencyStore,
		listeners : {
			selectionchange : function(selModel, recs) {
				this.selectedAgencies = [];
				for ( var x in recs) {
					var rec = recs[x];
					this.selectedAgencies.push(rec.data.value)
				}
				if (recs.length > 0) {
					this.agencyTree.setTitle("${tr.Agencies}: selected")
				} else {
					this.agencyTree.setTitle("${tr.Agencies}: All admin")
				}
			},

			beforeselect : function(tree, record, index, eOpts) {
				return record.data.admin
			},
			//select : selectTreeNodes,
			//deselect : deselectTreeNodes,

			scope : this
		},
		selModel : {
			selType : 'checkboxmodel',
			mode : 'MULTI'
		},
		region : "east"
	});

	this.middleSection = Ext.create('Ext.form.Panel', {
		region : "center",
		layout : "border",

		items : [ this.conditionsGrid, this.agencyTree ]
	});

	this.win = new Ext.Window({
		tbar : [ {
			text : '${tr.Lock}',
			id : "btn_lock",
			aa_id : "lock",
			iconCls : 'icon-lock16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}

		}, {
			text : '${tr.Unlock}',
			id : "btn_unlock",
			aa_id : "unlock",
			iconCls : 'icon-unlock16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}

		}, {
			text : '${tr.Check in}',
			aa_id : "save",
			id : "btn_checkin",

			iconCls : 'icon_save_maj',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}
		}, {
			xtype : 'tbseparator',
			id : "tlb_sep_run"
		}, {
			text : '${tr.Run}',
			aa_id : "run",
			id : "btn_rule_run_rule",
			iconCls : 'icon-play16',
			scope : this,
			handler : function(btn) {
				this.onButtonClick(btn)
			}
		}, '-', '<b>${tr.Record Type}:</b> <span id="spn_record_type"></span>', '->', '<b>Version:</b> <span id="spn_version" style="width:100">1.0.0</span>' ],
		closable : true,
		resizable : true,
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Rule Definition}",
		width : grid.getWidth() + 50,
		height : grid.getHeight(),

		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.form, this.middleSection, this.actionsSection ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});
	this.adjustButtons = function(record) {
		var readOnly = record.get("PID") != "";
		var isNew = record.get("ID") == "-1";
		var isDelete = record.get("REC_STATUS") != "A";
		var lock = record.get("RLOCK")
		if (isDelete) {
			readOnly = true;
		}
		var controls = [ "btn_addcondition", "btn_deletecondition", "btn_addthenaction", "btn_addelseaction", "btn_deleteaction", "btn_checkin" ]
		for ( var x in controls) {
			Ext.getCmp(controls[x]).hide()
		}

		var sep2 = Ext.getCmp("tlb_sep_run")
		var run_btn = Ext.getCmp("btn_rule_run_rule");
		var lock_btn = Ext.getCmp("btn_lock");
		var unlock_btn = Ext.getCmp("btn_unlock");

		sep2.hide();
		run_btn.hide();
		lock_btn.hide();
		unlock_btn.hide();
		if (isNew) {
			for ( var x in controls) {
				Ext.getCmp(controls[x]).show()
			}
		} else {
			if (!readOnly) {

				sep2.show();
				run_btn.show()
				if (lock) {
					if (lock == "${se.userId}") {
						unlock_btn.show();
						for ( var x in controls) {
							Ext.getCmp(controls[x]).show()
						}

					} else {
						lock_btn.show();
						lock_btn.disable();
						lock_btn.setTooltip("Locked by " + lock)
					}
				} else {
					lock_btn.show();
					lock_btn.enable();
					lock_btn.setTooltip("")
				}
			}
		}

	}
	this.loadRecord = function(record) {
		this.form.getForm().reset()
		this.form.getForm().loadRecord(record);
		var data = record.get("RDATA");
		if (data) {
			data = Ext.decode(data);
			var arrConditions = data.RCONDITIONS;
			if (arrConditions != null) {
				for ( var x in arrConditions) {
					rec = Ext.create('conditionitem', arrConditions[x]);
					this.conditionsStore.insert(x, rec);
				}
			}
		}

		this.loadActions();
		this.agencyTree.getSelectionModel().deselectAll()
		this.selectAgencies(this.agencyTree.getRootNode())
		Ext.get("spn_record_type").setHTML(this.getRecordType())
		if (record.get("RCATEGORY") != null) {
			this.pageFlowStore.reload();
		}
		if (record.get("REVENT") == "pageflow") {
			this.form.getForm().findField("RSCOPE").show();
		}
	}
	this.reload = function() {
		openRule(this.win.RECORD)
	}
	this.open = function(record) {
		Ext.getBody().setStyle("font-size", "")
		this.win.show();
		this.win.RECORD = record;
		this.form.getForm().reset();
		this.conditionsGrid.getStore().removeAll();
		this.actionsGrid.getStore().removeAll();
		this.loadRecord(record);
		this.adjustButtons(record);
		this.configPanel.setTitle("Properties")
		this.configPanel.setSource();
		this.configPanel.actionID = "";

		Ext.get("spn_version").setHTML(record.get("VERSION"))
		_ruleRecType = this.getRecordType();
	}

	this.onButtonClick = function(btn) {
		console.log(btn.aa_id + " fired")

		if (btn.aa_id == "addCondition") {

			var store = this.conditionsStore;
			var grid = this.conditionsGrid;
			var idx = store.getCount();
			rec = Ext.create('conditionitem', {

			});
			store.insert(idx, rec);
			grid.getView().select(idx);
			this.conditionGridcellEditing.startEditByPosition({
				row : idx,
				column : 1
			});
		} else if (btn.aa_id == "addAction") {

			var store = this.actionsStore;
			//store.clearGrouping( )
			var grid = this.actionsGrid;
			var idx = store.getCount();
			rec = Ext.create('actionitem', {
				ORDER : idx,
				CONDITION : btn.aa_scope
			});
			store.insert(idx, rec);

			//			store.group("CONDITION")
			//			grid.getView().select(idx);
			//			this.actionGridcellEditing.startEditByPosition({
			//				row : idx,
			//				column : 2
			//			});
		} else if (btn.aa_id == "save") {
			this.save(btn)
		} else if (btn.aa_id == "run") {
			var frm = this.form.getForm();
			var record = frm.getRecord();
			if (record.get("ID") != -1) {
				openDebugger(record);
			}
		} else if (btn.aa_id == "deleteselected") {
			var g = btn.up("grid")
			var selection = g.getSelectionModel().getSelection();

			g.getStore().remove(selection);

		} else if (btn.aa_id == "lock" || btn.aa_id == "unlock") {
			var frm = this.form.getForm();
			var record = frm.getRecord();
			_ruleForm.record = record;
			if (record.get("ID") != -1) {
				this.win.getEl().mask("Working...")
				execScriptByCode("EXT_BRE_HANDLEEVENTS", {
					CMD : btn.aa_id,
					ID : record.get("ID")

				}, function(status, response) {
					_ruleForm.win.getEl().unmask();
					try {
						_ruleForm.reload()
					} catch (e) {
						showError(e)
					}

				})
			}
		}
	}
	this.getEvent = function() {

		return this.form.getForm().findField("REVENT").getValue()
	}
	this.getID = function() {
		var frm = this.form.getForm();
		var record = frm.getRecord();

		return record.get("ID");
	}
	this.getData = function() {

		var ca = this.actionsStore.getNewRecords();
		var arrActions = [];
		if (ca.length > 0) {
			for ( var i in ca) {
				var ar = ca[i]
				//todo:validate
				arrActions.push(ar.data);
			}
		}
		var data = {};
		data.RACTIONS = arrActions;
		return Ext.encode(data);
	}

	this.getOrder = function() {
		return this.form.getForm().findField("RORDER").getValue()
	}
	this.getAgencies = function() {
		return this.selectedAgencies
	}
	this.getRecordType = function() {
		var record = this.form.getForm().getRecord();

		var module = record.get("RMODULE")
		if (!module) {
			module = "*"
		}
		var type = record.get("RTYPE")
		if (!type) {
			type = "*"
		}
		//Burtamekh was here
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
	this.save = function(btn) {
		try {

			var frm = this.form.getForm();

			if (!frm.isValid()) {
				throw "Please fix the Errors First"
			}

			var ca = this.actionsStore.getNewRecords();
			if (ca.length == 0) {
				throw "Please specify at least one action";
			}
			var version = this.win.RECORD.get("VERSION")
			var id = this.win.RECORD.get("ID");

			var btntext = {}
			if (id == "-1") {
				btntext = {
					ok : '1.0.0',
					cancel : 'Cancel'
				};
			} else {
				var arrv = version.split(".");
				for ( var x in arrv) {
					arrv[x] = parseInt(arrv[x], 10)
				}
				btntext = {
					ok : '',
					yes : '',
					no : '',
					cancel : 'Cancel'
				};
				arrv[2]++;
				version = arrv.join(".")
				btntext.no = version;

				arrv[1]++;
				arrv[2] = 0
				version = arrv.join(".")
				btntext.yes = "Publish (" + version + ")";
				;

				arrv[0]++;
				arrv[1] = 0
				arrv[2] = 0;
				version = arrv.join(".")
				btntext.ok = "Publish (" + version + ")";

			}

			Ext.MessageBox.show({
				title : 'Check in as?',
				msg : 'Check in comments',
				width : 600,
				buttonText : btntext,
				prompt : true,
				icon : Ext.Msg.QUESTION,
				fn : function(btnx, comment) {
					if (btnx != "cancel") {
						var versionType = "MOD";
						switch (btnx) {
						case "ok":
							versionType = "MAJ";
							break
						case "yes":
							versionType = "MIN";
							break
						case "no":
							versionType = "Modification";
							break

						}
						_ruleForm.form.getForm().findField("RLOCK").setValue()
						if (comment) {
							_ruleForm.form.getForm().findField("RDESCRIPTION").setValue(comment)
						}

						_ruleForm.dosave(versionType)
					}

				}

			});

			/*	Ext.MessageBox.prompt('${tr.Checkin}', '${tr.Please enter your comments}:', function(btnx, comment) {
					if (btnx == "ok") {
						this.form.getForm().findField("RLOCK").setValue()
						if (comment) {
							this.form.getForm().findField("RDESCRIPTION").setValue(comment)
						}

						this.dosave(btn.VERSION_TYPE)
					}

				}, this);*/
		} catch (e) {
			showError(e)
		}
	}
	this.generateScript = function() {
		var cc = this.conditionsStore.getNewRecords();
		var arrConditions = [];
		if (cc.length > 0) {
			for ( var i in cc) {
				var cr = cc[i]
				//todo:validate
				arrConditions.push(cr.data);
			}
		}
		var condition = INSTRUCTION.getConditon(Ext.encode(arrConditions));
		var script = "/** BRE GENERATED SCRIPT*/\n";
		var ca = this.actionsStore.getNewRecords();
		var arrActions = [];
		if (ca.length > 0) {
			for ( var i in ca) {
				var ar = ca[i]
				arrActions.push(ar.data)
			}
		}
		arrActions.sort(function(a, b) {
			return a.ORDER - b.ORDER
		})

		script += "if(" + condition + "){\n";
		for ( var i in arrActions) {
			var params = arrActions[i]
			if (params.CONDITION == true) {
				if (params.PARAMS == "") {
					params.PARAMS = "{}";
				}
				script += "//execute " + params.ACTION + "\n";
				script += "\tthis.executeAction('" + params.ACTION + "'," + params.PARAMS + ");\n";
			}
		}

		script += "}else{\n";
		for ( var i in arrActions) {
			var params = arrActions[i]
			if (!params.CONDITION) {
				script += "\tthis.executeAction('" + params.ACTION + "'," + params.PARAMS + ");\n";
			}
		}

		script += "}";
		return script;

	}

	this.dosave = function(VERSION_TYPE) {
		try {

			var frm = this.form.getForm();

			if (!frm.isValid()) {
				throw "Please fix the Errors First"
			}
			var record = frm.getRecord();
			frm.updateRecord(record)
			var DATA = record.data;
			DATA.VERSION_TYPE = VERSION_TYPE
			var cc = this.conditionsStore.getNewRecords();
			var arrConditions = [];
			if (cc.length > 0) {
				for ( var i in cc) {
					var cr = cc[i]
					//todo:validate
					arrConditions.push(cr.data);
				}
			}
			var data = {};
			data.RCONDITIONS = arrConditions;
			var ca = this.actionsStore.getNewRecords();
			var arrActions = [];
			if (ca.length > 0) {
				for ( var i in ca) {
					var ar = ca[i]
					//todo:validate
					arrActions.push(ar.data);
				}
			}
			if (arrActions.length == 0) {
				throw "Please specify at least one action";
			}
			data.RACTIONS = arrActions;
			DATA.RDATA = Ext.encode(data);
			DATA.RSCRIPT = this.generateScript();
			DATA.AGENCIES = this.selectedAgencies.join(",");
			this.win.getEl().mask("Saving...")
			Ext.Ajax.request({
				url : 'ADS?action=execscriptbycode&CMD=saveRule&SCRIPT=EXT_BRE_HANDLEEVENTS',
				params : {
					"JSON" : JSON.stringify(DATA)
				},
				success : function(res) {
					var response = res.responseText + "";
					try {
						var ret = eval(response)[0]
						if (ret.success == true) {
							var frm = _ruleForm.form.getForm();
							var record = frm.getRecord();

							if (record.get("ID") == "-1") {
								record.set("ID", ret.ID)
								itemSearchStore.insert(0, record)
							}
							for ( var x in ret.DATA) {
								record.set(x, ret.DATA[x])
							}
							grid.getStore().commitChanges()
							_ruleForm.win.close();
							openRule(record)
						} else {
							throw ret.message;
						}
					} catch (e) {

						showError(e)

					} finally {
						_ruleForm.win.getEl().unmask();
					}

				},
				failure : function() {
					showError("Save Failed")
					_ruleForm.win.getEl().unmask();
				}
			});
		} catch (e) {
			showError(e)
		}
	}
}

function HistoryWindow() {

	this.historySearchStore = Ext.create('Ext.data.Store', {
		model : 'bruleitem',
		remoteSort : true,
		remoteFilter : true,
		pageSize : 100,
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listHistory',

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
	this.historygrid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		features : [ groupingFeature, {
			ftype : "rowwrap"
		} ],
		disableSelection : false,
		forceFit : true,
		selType : "rowmodel",
		store : this.historySearchStore,
		viewConfig : {

			enableTextSelection : true
		},
		defaults : {
			sortable : true
		},
		columns : [ {
			text : "${tr.Name}",

			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'RNAME'
		}, {
			text : "${tr.Created By}",
			width : 50,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'REC_USER'
		}, {
			xtype : 'datecolumn',
			text : "${tr.Creation Date}",
			width : 50,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'REC_DATE'
		}, {

			text : "${tr.Version}",
			width : 25,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'VERSION'
		}, {
			text : "${tr.Comments}",
			width : 150,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'RDESCRIPTION'
		}, {

			text : "${tr.Tag}",
			width : 50,
			tdCls : 'search_item_grid wrap-text',
			dataIndex : 'TAG'
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
					text : '${tr.Restore}',
					iconCls : 'icon-restore16',
					id_aa : 'restorefromHistory',
					scope : this,
					handler : onContextMenuClick
				}, '-', {

					text : '${tr.dataManager.datagrid.refresh.label}',
					iconCls : 'icon-refresh16',
					scope : this,
					handler : function() {
						this.getStore().reload();
					}
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
			store : this.historySearchStore,
			pageSize : this.historySearchStore.pageSize,
			displayInfo : true,
			displayMsg : '{0} - {1} of {2}',
			emptyMsg : "No Revisions to display",
			plugins : [ new Ext.ux.ProgressBarPager(), new Ext.ux.grid.PageSize({
				beforeText : "Rows",
				afterText : ""
			}) ]
		})

	});

	this.win = new Ext.Window({
		closable : true,
		resizable : true,
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.History}",
		width : grid.getWidth(),
		height : grid.getHeight(),
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.historygrid ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});

	this.open = function(record) {
		var store = this.historygrid.getStore();
		store.filters.removeAtKey("PID");

		if (record) {
			store.addFilter({
				id : "PID",
				property : "PID",
				value : record.get("ID")
			}, false)
		}
		store.loadPage(1);
		this.win.show();
	}
}
function Debugger() {
	this.debugStore = Ext.create('Ext.data.Store', {
		model : 'debugitem',
		remoteSort : false,
		remoteFilter : false
	});
	this.debugGrid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		disableSelection : true,
		forceFit : false,
		selType : "rowmodel",
		store : this.debugStore,
		sortableColumns : false,
		defaults : {
			sortable : false
		},
		viewConfig : {

			enableTextSelection : true
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
	this.configPanel = Ext.create('Ext.grid.property.Grid', {
		title : 'Parameters',
		width : 300,
		region : "west",
		source : {}
	});
	this.onRunComplete = function(status, responseText) {

		_debugger.win.getEl().unmask();
		try {
			_debugger.debugStore.loadData(Ext.decode(responseText))
		} catch (e) {
			console.log(e)
		}
	}
	this.runRule = function() {
		var p = this.configPanel;
		this.debugStore.loadData([]);
		var data = Ext.encode(p.getSource());
		this.win.getEl().mask("Executing rule")
		execScriptByCode("EXT_BRE_HANDLEEVENTS", {
			CMD : "runEvent",
			EVENTPARAMS : data,
			EVENT : this.win.record.get("REVENT"),
			ID : this.win.record.get("ID")
		}, this.onRunComplete)
	}
	this.win = new Ext.Window({
		closable : true,
		resizable : true,
		tbar : [ {
			text : "${tr.Run}",
			iconCls : 'icon-play16',
			handler : this.runRule,
			scope : this
		} ],
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Debugger}",
		width : grid.getWidth(),
		height : grid.getHeight(),
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.configPanel, this.debugGrid ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});
	this.updateSource = function(status, responseText) {

		_debugger.configPanel.unmask();
		try {
			var source = Ext.decode(responseText)[0];
			_debugger.configPanel.setSource(source);

		} catch (e) {
			console.log(e)
		}
	}
	this.open = function(record) {
		var event = record.get("REVENT");
		this.win.record = record;
		this.win.show();

		this.configPanel.setSource(null, null);
		this.debugStore.loadData([]);
		this.configPanel.mask("Loading...")
		execScriptByCode("EXT_BRE_HANDLEEVENTS", {
			CMD : "getEventParams",
			ID : this.win.record.get("ID")
		}, this.updateSource)

	}
}

function LogViewer() {
	this.debugStore = Ext.create('Ext.data.Store', {
		model : 'debugitem',
		remoteSort : false,
		remoteFilter : false
	});
	this.logStore = Ext.create('Ext.data.Store', {
		model : 'logitem',
		remoteSort : true,
		remoteFilter : true,
		pageSize : 20,
		proxy : {
			type : 'ajax',
			url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=listLogs',

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
	this.logGrid = Ext.create('Ext.grid.Panel', {
		region : "west",
		loadMask : true,
		disableSelection : true,
		forceFit : true,
		selType : "rowmodel",
		width : "50%",
		store : this.logStore,
		features : [ filters, groupingFeature, {
			ftype : "rowwrap"
		} ],
		viewConfig : {

			enableTextSelection : true
		},
		split : true,
		defaults : {
			sortable : true
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
			dataIndex : "AGENCY",
			text : "${tr.Agency}",
			filterable : true,
			tdCls : 'search_item_grid wrap-text'
		}, {
			dataIndex : "CAPID",
			text : "${tr.Record ID}",
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
			store : this.logStore,
			pageSize : this.logStore.pageSize,
			displayInfo : true,
			displayMsg : '{0} - {1} of {2}',
			emptyMsg : "No Hisotry to display",
			plugins : [ new Ext.ux.grid.PageSize({
				beforeText : "Rows",
				afterText : ""
			}) ]
		}),
		listeners : {
			cellclick : function(searchGrid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
				this.debugGrid.mask("loading...")
				execScriptByCode("EXT_BRE_HANDLEEVENTS", {
					ID : record.get("ID"),
					CMD : "getSingleLog"

				}, function(serverstat, response) {
					try {

						_logViewer.debugGrid.unmask()
						_logViewer.debugStore.loadData(Ext.decode(response))
					} catch (e) {
						showError(e)
					}
				})

			},
			scope : this
		}
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
		viewConfig : {

			enableTextSelection : true
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
		tbar : [ {
			text : "${tr.Refresh}",
			iconCls : 'icon-refresh16',
			handler : function() {
				this.logStore.reload();
			},
			scope : this
		}, {
			text : "${tr.Clear}",
			iconCls : 'icon-delete16',
			handler : function(btn) {
				execScriptByCode("EXT_BRE_HANDLEEVENTS", {
					CMD : "clearLogs"

				}, function(serverstat, response) {
					try {

						handleServerResponse(serverstat, response)
						_logViewer.logStore.loadPage(1)
					} catch (e) {
						showError(e)
					}
				})

			},
			scope : this
		} ],
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Logs}",
		width : grid.getWidth(),
		height : grid.getHeight(),
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.logGrid, this.debugGrid ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});

	this.open = function() {
		this.win.show();
		this.win.maximize()
		this.debugStore.loadData([]);
		this.logStore.reload();

	}
}

function RuleShare() {
	this.onRunComplete = function(status, responseText) {

		_ruleShare.win.getEl().unmask();
		try {
			_ruleShare.debugStore.loadData(Ext.decode(responseText))
		} catch (e) {
			console.log(e)
		}
	}
	this.share = function() {
		try {

			var p = this.form;
			this.debugStore.loadData([]);
			var ids = [];
			if (!this.form.getForm().isValid()) {
				throw "Please fill necessary information";
			}
			if (this.selectedAgencies.length == 0) {
				throw "Please select at least one agency";
			}
			for ( var x in this.records) {
				ids.push(this.records[x].data.ID)
			}
			var params = this.form.getForm().getValues(false, false, true, true);
			params["CMD"] = "shareRules";
			params.IDS = ids.join(",")
			params.AGENCIES = this.selectedAgencies.join(",")
			this.win.getEl().mask("Sharing ...")
			execScriptByCode("EXT_BRE_HANDLEEVENTS", params, this.onRunComplete)
		} catch (e) {
			showError(e)
		}
	}
	this.debugStore = Ext.create('Ext.data.Store', {
		model : 'debugitem',
		remoteSort : false,
		remoteFilter : false
	});
	this.selectedAgencies = [];
	this.agencyTree = Ext.create('Ext.ux.TreeFilter', {
		title : "${tr.Agencies}",
		rootVisible : false,
		store : agencyStore,
		listeners : {
			selectionchange : function(selModel, recs) {
				this.selectedAgencies = [];
				for ( var x in recs) {
					var rec = recs[x];
					this.selectedAgencies.push(rec.data.value)
				}

			},

			beforeselect : function(tree, record, index, eOpts) {
				return record.data.admin
			},

			scope : this
		},
		selModel : {
			selType : 'checkboxmodel',
			mode : 'MULTI'
		},
		region : "center"
	});
	this.debugGrid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		disableSelection : true,
		forceFit : false,
		selType : "rowmodel",
		store : this.debugStore,
		sortableColumns : false,
		defaults : {
			sortable : false
		},
		viewConfig : {

			enableTextSelection : true
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

	this.form = Ext.create('Ext.form.Panel', {
		region : "north",
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		border : false,
		bodyPadding : 10,
		title : "${tr.Options}",
		fieldDefaults : {
			labelWidth : 110,
		},
		items : [ {
			xtype : 'fieldcontainer',
			layout : 'hbox',

			items : [ {
				flex : 1,
				xtype : "checkboxfield",
				fieldLabel : '${tr.Validate?}',
				name : 'RVALIDATE',

			} ]
		}, {
			xtype : 'fieldcontainer',
			layout : 'hbox',

			items : [ {
				flex : 1,
				xtype : "checkboxfield",
				fieldLabel : '${tr.Stop On Error?}',
				name : 'STOPONERROR',

			} ]
		}, {
			xtype : 'fieldcontainer',
			layout : 'hbox',

			items : [ {
				flex : 1,
				xtype : "checkboxfield",
				fieldLabel : '${tr.Duplicate?}',
				name : 'DUPLICATE',

			} ]
		} ]
	})
	this.win = new Ext.Window({
		closable : true,
		resizable : true,
		tbar : [ {
			text : "${tr.Share}",
			iconCls : 'icon-share16',
			handler : this.share,
			scope : this
		}, {
			text : "${tr.Cancel}",
			iconCls : 'icon_delete',
			handler : function() {
				this.up("window").close()
			}

		} ],
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Share}",
		iconCls : "icon-share16",
		width : grid.getWidth(),
		height : grid.getHeight(),
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ {
			xtype : "panel",
			region : "west",
			width : 400,
			layout : "border",
			items : [ this.form, this.agencyTree ]
		}, this.debugGrid ]

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
		this.debugStore.removeAll();
		this.records = records;
		this.win.setTitle("Share " + this.records.length + " Rule(s)?");

	}
}

function Refactor() {
	this.onRunComplete = function(status, responseText) {

		_refactor.win.getEl().unmask();
		try {
			_refactor.debugStore.loadData(Ext.decode(responseText))
		} catch (e) {
			console.log(e)
		}
	}
	this.refactor = function() {
		try {

			var p = this.form;
			var ofield = this.form.getForm().findField("OLDFIELDNAME").getValue();
			var nfield = this.form.getForm().findField("NEWFIELDNAME").getValue();
			var otask = this.form.getForm().findField("OLDTASKNAME").getValue();
			var ntask = this.form.getForm().findField("NEWTASKNAME").getValue();
			if (ofield && !nfield || nfield && !ofield) {
				throw "Please fill old and new field name";
			}
			if (otask && !ntask || ntask && !otask) {
				throw "Please fill old and new task name";
			}
			if (!ofield && !otask) {
				throw "Please fill at least field names or task names";
			}
			if (ofield == nfield && nfield != "") {
				throw "Old field name is the same as the new"
			}
			if (otask == ntask && ntask != "") {
				throw "Old task name is the same as the new"
			}
			var params = this.form.getForm().getValues(false, false, true, true);
			params["CMD"] = "refactor";
			this.win.getEl().mask("Refactoring ...")
			execScriptByCode("EXT_BRE_HANDLEEVENTS", params, this.onRunComplete)
		} catch (e) {
			showError(e)
		}
	}
	this.debugStore = Ext.create('Ext.data.Store', {
		model : 'debugitem',
		remoteSort : false,
		remoteFilter : false
	});
	this.debugGrid = Ext.create('Ext.grid.Panel', {
		region : "center",
		loadMask : true,
		disableSelection : true,
		forceFit : false,
		selType : "rowmodel",
		store : this.debugStore,
		sortableColumns : false,
		defaults : {
			sortable : false
		},
		viewConfig : {

			enableTextSelection : true
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

	this.form = Ext.create('Ext.form.Panel', {
		region : "north",
		layout : {
			type : 'vbox',
			align : 'stretch'
		},
		border : false,
		bodyPadding : 10,

		fieldDefaults : {
			labelWidth : 110,
		},
		items : [ {
			xtype : 'fieldset',
			layout : 'hbox',
			title : "${tr.Scope}",
			items : [ {
				flex : 1,
				padding : '5 5 5 5',
				xtype : "displayfield",
				fieldLabel : '${tr.RecordType}',
				name : 'RECORDTYPE',

			} ]
		}, {
			xtype : 'fieldset',
			layout : 'hbox',
			title : "Application Specific info",
			items : [ {
				flex : 1,
				padding : '5 5 5 5',
				xtype : "textfield",
				fieldLabel : '${tr.Old Field Name}',
				name : 'OLDFIELDNAME',

			}, {
				flex : 1,
				padding : '5 5 5 5',
				xtype : "textfield",
				fieldLabel : '${tr.New Field Name}',
				name : 'NEWFIELDNAME',

			} ]
		}, {
			xtype : 'fieldset',
			layout : 'hbox',
			title : "Workflow Task Name",
			items : [ {
				flex : 1,
				padding : '5 5 5 5',
				xtype : "textfield",
				fieldLabel : '${tr.Old Task Name}',
				name : 'OLDTASKNAME',

			}, {
				flex : 1,
				padding : '5 5 5 5',
				xtype : "textfield",
				fieldLabel : '${tr.New Task Name}',
				name : 'NEWTASKNAME',

			} ]
		} ]
	})
	this.win = new Ext.Window({
		closable : true,
		resizable : false,
		tbar : [ {
			text : "${tr.Refactor}",
			iconCls : 'icon-refactor16',
			handler : this.refactor,
			scope : this
		}, {
			text : "${tr.Cancel}",
			iconCls : 'icon_delete',
			handler : function() {
				this.up("window").close()
			}

		} ],
		maximizable : false,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Refactor}",
		iconCls : "icon-refactor16",
		width : grid.getWidth(),
		height : grid.getHeight(),
		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.form, this.debugGrid ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});

	this.open = function(recordType) {
		this.win.show();
		this.form.getForm().reset()
		this.form.getForm().findField("RECORDTYPE").setValue(recordType);
		this.debugStore.removeAll();

	}
}