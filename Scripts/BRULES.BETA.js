/*------------------------------------------------------------------------------------------------------/
| Program		: BRULES.BETA.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 24/01/2017 21:33:52
|
/------------------------------------------------------------------------------------------------------*/
var _rulebetainstance = null;
function _rulebetaeditorload(editor) {
	_rulebetainstance.jseditor = editor;
}
function RuleBeta() {
	_rulebetainstance = this;
	Ext.define('actiondefinition', {
		extend : 'Ext.data.Model',
		fields : [ 'value', 'text', 'params' ]
	});

	Ext.define('codemodel', {
		extend : 'Ext.data.Model',
		fields : [ 'NAME', 'LABEL', 'PARAMS', "CONFIG" ]
	});

	this.configPanel = Ext.create('Ext.grid.property.Grid', {
		title : 'Properties',
		width : 400,
		region : "east",
		resizable : false,
		sortableColumns : false,
		id : "config_panel_beta",

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

				var ptype = INSTRUCTION.getType(p.record.get("NAME"));
				if (ptype) {
					label = ptype.getLabel(p.getSource());
					p.record.set("LABEL", label);
				}
				this.generateScript()
			},
			scope : this
		},
		source : {}
	});
	this.ActionSelectorStore = new Ext.data.JsonStore({
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
				//this.loadActions()
			},
			scope : this
		},
		model : 'actiondefinition'
	});
	this.ActionSelectorWin = new Ext.Window({

		closable : true,
		resizable : true,
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.select Action}",
		width : 510,
		height : 300,

		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ {
			xtype : "grid",
			region : "center",
			loadMask : true,
			disableSelection : false,
			forceFit : true,
			store : this.ActionSelectorStore,
			defaults : {
				sortable : true
			},
			tbar : [ {
				xtype : 'triggerfield',
				triggerCls : 'x-form-clear-trigger',
				trigger2Cls : 'x-form-search-trigger',
				emptyText : '${tr.ACA_TopPage_ButtonTips_Search} ...',

				allowBlank : true,
				selectOnFocus : true,
				width : 480,
				search : function() {
					this.up("grid").store.removeFilter(null, true);
					if (this.getValue() != "") {

						this.up("grid").store.filter("text", this.getValue())
					}

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
					keyup : function(field, e, eOpts) {
						this.search();
					}

				}
			} ],
			listeners : {
				celldblclick : function(searchGrid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
					this.addInstruction(this.ActionSelectorWin.btn, record.data)
					this.ActionSelectorWin.close();
				},
				scope : this
			},
			columns : [ {
				text : "${tr.ID}",
				width : '60',
				hidden : true,
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'value'
			}, {
				text : "${tr.Action}",
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'text'
			} ]
		} ]
	})

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

			model : 'STDChoice'
		})
	}

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
		}

	});
	this.propertiesSection = Ext.create('Ext.form.Panel', {
		region : "east",
		width : 300,
		collapseMode : "mini",
		collapsible : false,
		split : true,
		layout : {
			type : 'accordion',
			titleCollapse : true,
			animate : true,
			activeOnTop : true
		},
		width : 350,
		items : [ this.configPanel, this.agencyTree ]
	});
	this.bodySrc = Ext.create('Ext.panel.Panel', {
		region : "center",
		title : "${tr.Code}",
		layout : 'fit',
		plain : true,
		items : [ {
			xtype : 'box',
			autoEl : {
				tag : 'iframe',
				src : 'ADS?Template=web/lib/jseditor/editor.htm&CALLBACK=_rulebetaeditorload',
			}
		} ]
	});
	this.tbarInstructions = [];
	this.tbarInstructions.push({
		text : '${tr.Clear}',
		id : 'btn_beta_clear',
		iconCls : 'icon-delete16',
		scope : this,
		handler : function(btn) {
			this.bodyPanel.getRootNode().removeAll();
			this.generateScript()
		}

	});
	this.tbarInstructions.push('-');
	for ( var t in INSTRUCTION.TYPES) {

		var btn = INSTRUCTION.TYPES[t].getButton();
		btn.handler = this.onTreeContextMenuAction;
		btn.scope = this;
		btn.icon = "icons/icon16/" + INSTRUCTION.TYPES[t].name + ".png";
		btn.hidden = true;
		btn.instruction = INSTRUCTION.TYPES[t];
		this.tbarInstructions.push(btn);

	}

	this.bodyPanel = Ext.create('Ext.tree.Panel', {
		useArrows : true,
		rootVisible : true,
		multiSelect : false,
		title : "${tr.Designer}",
		tbar : this.tbarInstructions,
		closeable : false,
		singleExpand : false,
		region : "center",
		store : new Ext.data.TreeStore({
			model : 'codemodel',
			root : {
				name : "Root",
				expanded : true,
				NAME : "",
				icon : "icons/icon16/object.png",
				type : "Object",
				children : []
			},
			folderSort : false
		}),
		viewConfig : {
			plugins : {

				ptype : 'treeviewdragdrop'

			},
			listeners : {
				drop : function(node, data, overModel, dropPosition, eOpts) {
					this.onDropNode(node, data, overModel, dropPosition, eOpts)
				},
				nodedragover : function(overModel, dropPosition, dragData) {
					return this.onNodeDragOver(overModel, dropPosition, dragData);
				},
				scope : this,
			}

		},
		listeners : {
			cellcontextmenu : this.onTreeContextMenu,
			select : this.onTreeItemClick,
			scope : this
		},
		columns : [ {
			xtype : 'treecolumn', //this is so we know which column will show the tree
			text : 'Name',
			flex : 1,
			sortable : false,
			dataIndex : 'NAME'
		}, {
			text : 'Value',
			flex : 2,
			sortable : false,
			dataIndex : 'LABEL'

		} ]

	});

	this.tbar = [ {
		text : '${tr.Lock}',
		id : "btn_lock_beta",
		aa_id : "lock",
		iconCls : 'icon-lock16',
		scope : this,
		handler : function(btn) {
			this.onButtonClick(btn)
		}

	}, {
		text : '${tr.Unlock}',
		id : "btn_unlock_beta",
		aa_id : "unlock",
		iconCls : 'icon-unlock16',
		scope : this,
		handler : function(btn) {
			this.onButtonClick(btn)
		}

	}, {
		text : '${tr.Check in}',
		aa_id : "save",
		id : "btn_checkin_beta",

		iconCls : 'icon_save_maj',
		scope : this,
		handler : function(btn) {
			this.onButtonClick(btn)
		}
	}, {
		xtype : 'tbseparator',
		id : "tlb_sep_run_beta"
	}, {
		text : '${tr.Run}',
		aa_id : "run",
		id : "btn_rule_run_rule_beta",
		iconCls : 'icon-play16',
		scope : this,
		handler : function(btn) {
			this.onButtonClick(btn)
		}
	}, '-', '<b>${tr.Record Type}:</b> <span id="spn_record_type"></span>', '->', '<b>Version:</b> <span id="spn_version" style="width:100">1.0.0</span>' ];

	this.middleSection = Ext.create('Ext.tab.Panel', {

		region : 'center',
		tabPosition : 'bottom',
		defaults : {
			autoScroll : true
		},
		items : [ this.bodyPanel, this.bodySrc ]
	});
	this.win = new Ext.Window({
		tbar : this.tbar,
		closable : true,
		resizable : true,
		maximizable : true,
		collapsible : false,
		closeAction : "hide",
		title : "${tr.Rule Definition - Advanced Mode}",
		width : grid.getWidth() + 50,
		height : grid.getHeight(),

		autoScroll : false,
		plain : true,
		modal : true,
		layout : "border",
		items : [ this.form, this.middleSection, this.propertiesSection ]

	});

	this.win.on("move", function(win, x, y, eOpts) {
		if (x < 0 || y < 0) {
			x = x < 0 ? 10 : x;
			y = y < 0 ? 10 : y;
			win.setPosition(x, y, false)
		}
	});
}

RuleBeta.prototype.createCombo = function(url, allowBlank) {
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

RuleBeta.prototype.selectAgencies = function(node) {
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

RuleBeta.prototype.adjustButtons = function(record) {
	var readOnly = record.get("PID") != "";
	var isNew = record.get("ID") == "-1";
	var isDelete = record.get("REC_STATUS") != "A";
	var lock = record.get("RLOCK")
	if (isDelete) {
		readOnly = true;
	}
	var controls = [ "btn_checkin_beta", "btn_beta_clear" ]
	for ( var x in controls) {
		Ext.getCmp(controls[x]).hide()
	}

	var sep2 = Ext.getCmp("tlb_sep_run_beta")
	var run_btn = Ext.getCmp("btn_rule_run_rule_beta");
	var lock_btn = Ext.getCmp("btn_lock_beta");
	var unlock_btn = Ext.getCmp("btn_unlock_beta");

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
	var tbar = this.bodyPanel.getDockedItems('toolbar[dock="top"]')[0];
	var items = tbar.items.items

	for ( var x in items) {
		var btn = items[x]
		if (btn.instruction) {

			btn.hide()

		}

	}
}
RuleBeta.prototype.loadRecord = function(record) {
	this.form.getForm().reset()
	this.form.getForm().loadRecord(record);

	this.agencyTree.getSelectionModel().deselectAll()
	this.selectAgencies(this.agencyTree.getRootNode())
	Ext.get("spn_record_type").setHTML(this.getRecordType())
	if (record.get("RCATEGORY") != null) {
		this.pageFlowStore.reload();
	}
	if (record.get("REVENT") == "pageflow") {
		this.form.getForm().findField("RSCOPE").show();
	}
	var rootNode = this.bodyPanel.getRootNode();
	rootNode.removeAll();
	if (record.data.RDATA) {
		var data = Ext.decode(record.data.RDATA);
		var children = data.CHILDREN;
		for ( var c in children) {
			this.createNode(rootNode, children[c]);
		}

	}

}
RuleBeta.prototype.createNode = function(parentNode, data) {
	var children = data.CHILDREN;
	delete data.CHILDREN;
	data.icon = "icons/icon16/" + data.NAME + ".png";
	var rec = Ext.create('codemodel', data);
	var newNode = parentNode.appendChild(rec);
	parentNode.expand();
	for ( var x in children) {
		this.createNode(newNode, children[x])
	}
}
RuleBeta.prototype.reload = function() {
	openRule(this.win.RECORD)
}
RuleBeta.prototype.open = function(record) {
	Ext.getBody().setStyle("font-size", "")
	this.win.show();
	this.win.RECORD = record;
	this.form.getForm().reset();

	this.bodyPanel.getRootNode().removeAll();

	this.loadRecord(record);
	this.adjustButtons(record);
	this.configPanel.setTitle("Properties")
	this.configPanel.setSource();
	this.configPanel.actionID = "";
	this.bodySrc.show();
	this.bodyPanel.show()

	Ext.get("spn_version").setHTML(record.get("VERSION"))
	_ruleRecType = this.getRecordType();
}

RuleBeta.prototype.onButtonClick = function(btn) {
	console.log(btn.aa_id + " fired")

	if (btn.aa_id == "save") {
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
RuleBeta.prototype.getEvent = function() {

	return this.form.getForm().findField("REVENT").getValue()
}
RuleBeta.prototype.getData = function() {

	var rootNode = this.bodyPanel.getRootNode();

	rootNode.JSONOBJ = {
		CHILDREN : []
	};
	rootNode.eachChild(this.convertToJson, this)
	return JSON.stringify(rootNode.JSONOBJ, null, 2)
}
RuleBeta.prototype.getID = function() {
	var frm = this.form.getForm();
	var record = frm.getRecord();

	return record.get("ID");
}
RuleBeta.prototype.getOrder = function() {
	return this.form.getForm().findField("RORDER").getValue()
}
RuleBeta.prototype.getLock = function() {
	return this.form.getForm().findField("RLOCK").getValue()
}
RuleBeta.prototype.getAgencies = function() {
	return this.selectedAgencies
}
RuleBeta.prototype.getRecordType = function() {
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
RuleBeta.prototype.save = function(btn) {
	try {

		var frm = this.form.getForm();

		if (!frm.isValid()) {
			throw "Please fix the Errors First"
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
RuleBeta.prototype.createTypeFromNode = function(n) {
	var data = {};

	data.CONFIG = n.data.CONFIG;
	data.PARAMS = n.data.PARAMS;
	data.NAME = n.data.NAME;
	data.LABEL = n.data.LABEL
	data.CHILDREN = [];
	return data;

}
RuleBeta.prototype.convertToJson = function(n) {

	n.JSONOBJ = this.createTypeFromNode(n);

	n.parentNode.JSONOBJ.CHILDREN.push(n.JSONOBJ)

	n.eachChild(this.convertToJson, this)
}
RuleBeta.prototype.dosave = function(VERSION_TYPE) {
	try {

		var frm = this.form.getForm();

		if (!frm.isValid()) {
			throw "Please fix the Errors First"
		}
		var record = frm.getRecord();
		frm.updateRecord(record)
		var DATA = record.data;
		DATA.VERSION_TYPE = VERSION_TYPE

		var rootNode = this.bodyPanel.getRootNode();

		rootNode.JSONOBJ = {
			CHILDREN : []
		};
		rootNode.eachChild(this.convertToJson, this)
		DATA.RDATA = JSON.stringify(rootNode.JSONOBJ, null, 2)

		DATA.RSCRIPT = this.generateScript()

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

RuleBeta.prototype.onTreeContextMenu = function(tree, td, cellIndex, record, tr, rowIndex, e, eOpts) {
	e.stopEvent();
	if (this.getLock() == "${se.userId}" || this.win.RECORD.get("ID") == -1) {
		var menuItems = [];
		var curINST = INSTRUCTION.getType(record.get("NAME"));
		var instructions = INSTRUCTION.listTypes(record.get("NAME"));
		var newInstructions = []
		for ( var x in instructions) {
			var btn = instructions[x].getButton();
			btn.handler = this.onTreeContextMenuAction;
			btn.scope = this;
			btn.icon = "icons/icon16/" + instructions[x].name + ".png";
			btn.record = record;
			btn.instruction = instructions[x];
			newInstructions.push(btn);
		}
		if (newInstructions.length > 0) {
			menuItems.push({
				text : '${tr.Add}',
				iconCls : 'icon_add',
				menu : {
					items : newInstructions
				}

			});
		}
		if (record.parentNode && curINST.canDelete()) {
			menuItems.push({
				text : '${tr.Delete}',
				id_aa : 'id_delete',
				iconCls : 'icon-delete16',
				record : record,
				scope : this,
				handler : this.onTreeContextMenuAction
			})
		}

		if (menuItems.length > 0) {
			var rowMenu = Ext.create('Ext.menu.Menu', {
				items : menuItems
			});
			rowMenu.showAt(e.getXY());
		}
	}
}

RuleBeta.prototype.addNode = function(instruction, record, data) {
	var sc = instruction.getParams();

	if (data) {
		sc = Ext.decode(data.params)[0]
		if (!sc.source) {
			sc.source = {}
		}
		sc.source.ID = data.value;
		sc.source.CMD = data.text;

	}
	var icon = "icons/icon16/" + instruction.name + ".png";
	var label = instruction.getLabel(sc.source);
	var params = "{}";
	var config = "{}";
	if (sc.source) {
		params = Ext.encode(sc.source);
	}
	if (sc.config) {
		config = Ext.encode(sc.config);
	}

	var rec = Ext.create('codemodel', {
		NAME : instruction.name,
		LABEL : instruction.getLabel(sc.source),
		PARAMS : params,
		CONFIG : config,
		icon : icon

	});
	var childCounts = record.childNodes.length;

	var idx = childCounts - instruction.getIndexDecrementer();

	if (idx < 0) {
		idx = 0;
	}
	record.insertChild(idx, rec);
	record.expand();
	var forced = instruction.getForcedChildren();
	for ( var z in forced) {
		var instName = forced[z];
		var instf = INSTRUCTION.getType(instName);
		if (instf) {
			this.addNode(instf, rec, null);
		}
	}
	this.generateScript()
}
RuleBeta.prototype.addInstruction = function(btn, data) {

	this.addNode(btn.instruction, btn.record, data)

}
RuleBeta.prototype.onTreeContextMenuAction = function(btn) {

	if (btn.id_aa == "id_menu_add") {
		if (btn.instruction.name == "CMD") {
			this.ActionSelectorWin.btn = btn;
			this.ActionSelectorWin.show()
		} else {
			this.addInstruction(btn)
		}

	} else if (btn.id_aa == "id_delete") {
		btn.record.remove(true)
	}
}

RuleBeta.prototype.onTreeItemClick = function(panel, record) {
	if (record.internalId != "root") {
		var instype = record.get("NAME");
		this.configPanel.record = record;
		this.configPanel.actionID = "INSTRUCTION_" + instype
		this.configPanel.setTitle("Properties: " + instype)
		var ptype = INSTRUCTION.getType(instype)
		var source = Ext.decode(record.get("PARAMS"))
		var config = Ext.decode(record.get("CONFIG"))

		for ( var x in config) {
			var field = config[x];
			if (field.editor && field.editor.xtype == "combo") {
				field.editor.store.listeners = {};
				field.editor.store.listeners.beforeload = function(store, operation, eOpts) {
					operation.params = {
						"RECTYPE" : _ruleForm.getRecordType()
					}
				}
			}
		}

		this.configPanel.setSource(source, config);
	}
	if (this.getLock() == "${se.userId}" || this.win.RECORD.get("ID") == -1) {
		var tbar = this.bodyPanel.getDockedItems('toolbar[dock="top"]')[0];
		var items = tbar.items.items
		var curINST = INSTRUCTION.getType(record.get("NAME"));
		var instructions = INSTRUCTION.listTypes(record.get("NAME"));
		for ( var x in items) {
			var btn = items[x]
			if (btn.instruction) {
				var instructionName = btn.instruction.name;
				var found = false;
				for ( var u in instructions) {
					if (instructions[u].name == instructionName) {
						found = true;
						break;
					}
				}
				if (found) {
					btn.show()
				} else {
					btn.hide()
				}
				btn.record = record;
			}

		}
	}

}
RuleBeta.prototype.generateScript = function() {
	var root = this.bodyPanel.getRootNode();
	var childs = root.childNodes;
	var script = "/** BRE GENERATED SCRIPT*/\n";
	for ( var x in childs) {
		script += this.generateNodeScript(childs[x], 0);
	}
	if (this.jseditor) {
		this.jseditor.setValue(script);
	}
	return script;

}

RuleBeta.prototype.generateNodeScript = function(node, level) {

	var s = "";
	var type = node.data.NAME;
	var ptype = INSTRUCTION.getType(type);
	if (ptype) {
		var strParams = node.data.PARAMS;
		var params = Ext.decode(strParams)
		s += ptype.getFormattedPrefix(params, level);
		var childs = node.childNodes;
		for ( var x in childs) {
			s += this.generateNodeScript(childs[x], level + 1);
		}
		s += ptype.getFormattedSuffix(params, level);
	}
	return s;
}

RuleBeta.prototype.onNodeDragOver = function(overModel, dropPosition, dragData) {
	var ret = false;
	var item = dragData.records[0];
	var type = item.data.NAME;
	var ptype = INSTRUCTION.getType(type);
	if (ptype.main) {
		var parent = "";
		if (dropPosition == "before" || dropPosition == "after") {
			parent = overModel.parentNode.data.NAME;
		} else {
			parent = overModel.data.NAME;
		}
		if (parent) {
			var parentPTYPE = INSTRUCTION.getType(parent);
			var allowed = parentPTYPE.getAllowedChildren();
			if (allowed.length > 0) {
				for ( var x in allowed) {
					var stype = allowed[x];
					if (stype == type) {
						ret = true;
						break;
					}
				}
			} else {
				ret = true;
			}
		} else {
			ret = true;
		}

	}

	return ret;
}
RuleBeta.prototype.onDropNode = function(node, data, overModel, dropPosition, eOpts) {
	this.generateScript();
}