/*------------------------------------------------------------------------------------------------------/
| Program		: BRULES.CONTROLS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 07/12/2016 16:34:55
|
/------------------------------------------------------------------------------------------------------*/
Ext.define('jsonmodel', {
	extend : 'Ext.data.Model',
	fields : [ "type", "name", "value", "children", "text" ]
})
Ext.define('headermodel', {
	extend : 'Ext.data.Model',
	fields : [ "key", "value" ]
})
Ext.define('conditionitem', {
	extend : 'Ext.data.Model',
	fields : [ 'PREFIX', 'FIELD', 'INTRAOPERATOR', 'VALUE', 'SUFFIX', 'OPERATOR' ]
});
Ext.define('Ext.form.field.conditionfield', {
	extend : 'Ext.form.field.Trigger',
	xtype : 'conditionfield',
	triggerCls : 'x-form-fx-trigger',
	emptyText : 'Accela condition editor',
	initComponent : function() {
		this.setData = function() {
			var cc = this.conditionsStore.getNewRecords();
			var arrConditions = [];
			if (cc.length > 0) {
				for ( var i in cc) {
					var cr = cc[i]
					//todo:validate
					arrConditions.push(cr.data);
				}
			}
			var newval = Ext.encode(arrConditions);

			this.setValue(newval);
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				this.record.set(fieldName, newval)
			}
			if (this.ownerCt.field.up().up().xtype == "propertygrid") {
				this.ownerCt.field.up().up().fireEvent("propertychange")
			}
		}
		this.loadData = function() {
			var conditions = this.getValue();
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				conditions = this.record.get(fieldName)
			}

			if (conditions != null && conditions != "") {
				var arrConditions = Ext.decode(conditions);
				for ( var x in arrConditions) {
					rec = Ext.create('conditionitem', arrConditions[x]);
					this.conditionsStore.insert(x, rec);
				}
			}
		}
		this.VALUE = "";
		this.setValue = function(x) {
			this.VALUE = x
		}
		this.getValue = function() {
			return this.VALUE;
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
		this.conditionsStore = Ext.create('Ext.data.JsonStore', {
			model : 'conditionitem'
		});
		this.conditionGridcellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit : 1

		});
		this.conditionsGrid = Ext.create('Ext.grid.Panel', {
			tbar : [ {
				text : '${tr.Add}',
				iconCls : 'icon-new16',
				scope : this,
				handler : function(btn) {
					var store = this.conditionsStore;
					var grid = this.conditionsGrid;
					var idx = store.getCount();
					rec = Ext.create('conditionitem', {

					});
					store.insert(idx, rec);
					grid.getView().select(idx);
					/*this.conditionGridcellEditing.startEditByPosition({
						row : idx,
						column : 1
					});*/
				}

			}, {
				text : '${tr.Delete}',
				iconCls : 'icon-delete16',
				scope : this,
				handler : function(btn) {
					var g = btn.up("grid")
					var selection = g.getSelectionModel().getSelection();

					g.getStore().remove(selection);
				}

			} ],
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

		this.win = new Ext.Window({
			closable : true,
			resizable : true,
			maximizable : true,
			collapsible : false,
			closeAction : "hide",
			title : "${tr.Accela Condition Builder}",
			width : 800,
			height : 340,
			autoScroll : false,
			plain : true,
			modal : true,

			bbar : [ '->', {
				text : "${tr.Ok}",
				iconCls : 'icon_save_min',
				scale : 'medium',
				handler : function() {
					try {
						this.setData();
						this.win.close();

					} catch (e) {
						showError(e)
					}
				},
				scope : this
			} ],
			layout : "border",
			items : [ this.conditionsGrid ]

		});

		this.win.on("move", function(win, x, y, eOpts) {
			if (x < 0 || y < 0) {
				x = x < 0 ? 10 : x;
				y = y < 0 ? 10 : y;
				win.setPosition(x, y, false)
			}
		});

		this.on('render', function(c) {
			c.getEl().down("input").dom.setAttribute("readOnly", true)
			//			c.getEl().on('dblclick', function() {
			//				this.onTriggerClick()
			//			}, this);
		});
		this.on('focus', function(component, events) {
			var g = component.up('grid');
			try {
				this.record = g.getSelectionModel().getSelection()[0];
			} catch (e) {

				g = component.up('treepanel');
				try {
					this.record = g.getSelectionModel().getSelection()[0];
				} catch (e) {
					this.record = null;
				}

			}

		}, this);

		this.onTriggerClick = function() {
			this.win.show();

			this.loadData();

		}
	},

	validateOnBlur : true

})
Ext.define('Ext.form.field.restfield', {
	extend : 'Ext.form.field.Trigger',
	xtype : 'restfield',
	triggerCls : 'x-form-fx-trigger',
	emptyText : 'Double click for json editor',
	initComponent : function() {

		this.VALUE = "";
		this.setValue = function(x) {
			this.VALUE = x
		}
		this.getValue = function() {
			return this.VALUE;
		}
		this.onMethodChange = function(cmb, method) {
			if (method == "GET" || method == "HEAD") {
				this.bodyPanel.disable();
				this.rawBody.disable();
			} else {
				this.bodyPanel.enable();
				this.rawBody.enable();
			}
		}
		this.form = Ext.create('Ext.form.Panel', {
			region : "north",
			getUrl : function() {
				return this.getForm().findField("URL").getValue();
			},
			setUrl : function(url) {
				this.getForm().findField("URL").setValue(url);
			},
			getMethod : function() {
				return this.getForm().findField("METHOD").getValue();
			},
			setMethod : function(url) {
				this.getForm().findField("METHOD").setValue(url);
			},
			layout : {
				type : 'hbox',
				align : 'stretch'
			},
			items : [ {
				emptyText : "Method",
				name : "METHOD",
				width : 70,
				xtype : "combo",

				queryMode : 'local',
				typeAhead : false,
				triggerAction : "all",
				forceSelection : true,
				displayField : 'text',
				valueField : 'value',
				value : "POST",
				allowBlank : false,
				listeners : {
					change : this.onMethodChange,
					scope : this
				},
				store : new Ext.data.Store({
					autoDestroy : true,
					model : 'STDChoice',
					data : [ {
						value : "GET",
						text : "GET"
					}, {
						value : "POST",
						text : "POST"
					}, {
						value : "PUT",
						text : "PUT"
					}, {
						value : "DELETE",
						text : "DELETE"
					}, {
						value : "TRACE",
						text : "TRACE"
					}, {
						value : "HEAD",
						text : "HEAD"
					}, {
						value : "OPTIONS",
						text : "OPTIONS"
					}, {
						value : "CONNECT",
						text : "CONNECT"
					} ]

				}),
				margins : '5 5 5 5'
			}, {

				emptyText : "write webservice url",
				xtype : "textfield",
				name : "URL",
				allowBlank : false,
				margins : '5 5 5 5',
				flex : 1
			} ]

		});
		this.loadJson = function(method) {

			var root = this.bodyPanel.getRootNode();
			root.removeAll();

		}

		this.bodyPanelcellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit : 1

		});
		this.bodyPanelcellEditing.on('beforeedit', function(e, eOpts) {
			var colName = eOpts.field;
			var rowIdx = eOpts.rowIdx;
			var record = eOpts.record;
			var value = eOpts.value;
			var editable = false;
			if (colName == "name" && record.parentNode) {
				editable = record.parentNode.data.type != "Array"
			} else {
				editable = record.data.type == "Simple"
			}
			return editable

		}, this);
		this.createTypeFromNode = function(n) {
			var type = n.data.type;
			var ret = null;
			if (type == "Object") {
				ret = {};
			} else if (type == "Array") {
				ret = [];
			} else {
				ret = n.data.value;
			}
			return ret;
		}
		this.createNodeFromObj = function(parentNode, name, n) {
			var type = "";
			if (Array.isArray(n)) {
				type = "Array"
			} else if (Ext.isString(n)) {
				type = "Simple";
			} else {
				type = "Object";
			}
			if (type == "Object") {
				value = "{}";
				icon = "icons/icon16/object.png";
			} else if (type == "Array") {
				value = "[]";
				icon = "icons/icon16/array.png";
			} else {
				value = n
				icon = "icons/icon16/simple.png";
			}

			var rec = Ext.create('jsonmodel', {
				name : name,
				icon : icon,
				type : type,
				value : value
			});
			var newNode = parentNode.appendChild(rec);
			parentNode.expand()
			if (type == "Object" || type == "Array") {
				for ( var x in n) {
					this.createNodeFromObj(newNode, x, n[x])
				}
			}
		}
		this.convertToJson = function(n) {

			var obj = this.createTypeFromNode(n)
			n.JSONOBJ = obj;
			var pobj = n.parentNode.JSONOBJ;
			if (Array.isArray(pobj)) {
				pobj.push(obj)
			} else {
				pobj[n.data.name] = obj
			}
			n.eachChild(this.convertToJson, this)

		}
		this.parseJson = function(json) {

			json = Ext.decode(json);
			var rootNode = this.bodyPanel.getRootNode();
			rootNode.removeAll();

			if (Array.isArray(json)) {
				rootNode.set("type", "Array")
				rootNode.set("icon", "icons/icon16/array.png");
				rootNode.set("value", "[]")
			} else {
				rootNode.set("type", "Object")
				rootNode.set("icon", "icons/icon16/object.png");
				rootNode.set("value", "{}")
			}
			for ( var f in json) {
				this.createNodeFromObj(rootNode, f, json[f])
			}

		}
		this.generateJson = function() {
			var rootNode = this.bodyPanel.getRootNode();

			var json = this.createTypeFromNode(rootNode);
			rootNode.JSONOBJ = json;
			rootNode.eachChild(this.convertToJson, this)
			var jtext = "";
			try {
				jtext = JSON.stringify(json, null, 2)
			} catch (e) {
				jtext = Ext.encode(json)
			}
			this.rawBody.set(jtext)
		}
		this.bodyPanelcellEditing.on('edit', function(e, eOpts) {
			this.generateJson();
		}, this);
		this.onTreeContextMenuAction = function(btn) {

			if (btn.id_aa == "id_menu_add") {
				var type = btn.id_action;
				var value = "";
				var icon = "";
				if (type == "Object") {
					value = "{}";
					icon = "icons/icon16/object.png";
				} else if (type == "Array") {
					value = "[]";
					icon = "icons/icon16/array.png";
				} else {
					value = "";
					icon = "icons/icon16/simple.png";
				}
				var name = type + "1";
				if (btn.record.data.type == "Array") {
					name = btn.record.childNodes.length + ""
				}
				var rec = Ext.create('jsonmodel', {
					name : name,
					icon : icon,
					type : type,
					value : value
				});
				btn.record.appendChild(rec);
				btn.record.expand()
			} else if (btn.id_aa == "id_menu_changetype") {
				var type = btn.id_action;
				var value = "";
				var icon = "";
				if (type == "Object") {
					value = "{}";
					icon = "icons/icon16/object.png";
				} else if (type == "Array") {
					value = "[]";
					icon = "icons/icon16/array.png";
				} else {
					value = "";
					icon = "icons/icon16/simple.png";
				}
				btn.record.set("value", value)
				btn.record.set("type", type)
				btn.record.set("icon", icon)
			} else if (btn.id_aa == "id_delete") {
				btn.record.remove(true)
			}
			this.generateJson();
		}
		this.onTreeContextMenu = function(tree, td, cellIndex, record, tr, rowIndex, e, eOpts) {
			e.stopEvent();

			var menuItems = [];
			if (record.data.type != "Simple") {

				menuItems.push({
					text : '${tr.Add}',
					iconCls : 'icon_add',
					menu : {
						items : [ {
							text : '${tr.Object}',
							id_action : "Object",
							id_aa : 'id_menu_add',
							iconCls : 'icon-object16',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						}, {
							text : '${tr.Array}',
							id_action : "Array",
							iconCls : 'icon-array16',
							id_aa : 'id_menu_add',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						}, {
							text : '${tr.Simple}',
							id_action : "Simple",
							id_aa : 'id_menu_add',
							iconCls : 'icon-simple16',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						} ]
					}

				});
				menuItems.push({
					text : '${tr.Change Type}',
					iconCls : 'icon_edit',
					menu : {
						items : [ {
							text : '${tr.Object}',
							id_action : "Object",
							id_aa : 'id_menu_changetype',
							iconCls : 'icon-object16',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						}, {
							text : '${tr.Array}',
							id_action : "Array",
							iconCls : 'icon-array16',
							id_aa : 'id_menu_changetype',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						}, {
							text : '${tr.Simple}',
							id_action : "Simple",
							id_aa : 'id_menu_changetype',
							iconCls : 'icon-simple16',
							record : record,
							scope : this,
							handler : this.onTreeContextMenuAction
						} ]
					}

				});
			}
			if (record.parentNode) {
				menuItems.push({
					text : '${tr.Delete}',
					id_aa : 'id_delete',
					iconCls : 'icon-delete16',
					record : record,
					scope : this,
					handler : this.onTreeContextMenuAction
				})
			}
			var rowMenu = Ext.create('Ext.menu.Menu', {
				items : menuItems
			});
			rowMenu.showAt(e.getXY());
		}
		this.bodyPanel = Ext.create('Ext.tree.Panel', {
			useArrows : true,
			rootVisible : true,
			multiSelect : false,
			title : "${tr.Body}",
			tbar : [ "use context menu to build body structure" ],
			closeable : false,
			singleExpand : false,
			plugins : this.bodyPanelcellEditing,
			region : "center",
			store : new Ext.data.TreeStore({
				model : 'jsonmodel',
				root : {
					name : "Root",
					expanded : true,
					value : "{}",
					icon : "icons/icon16/object.png",
					type : "Object",
					children : []
				},
				folderSort : true
			}),
			listeners : {
				cellcontextmenu : this.onTreeContextMenu,
				scope : this
			},
			columns : [ {
				xtype : 'treecolumn', //this is so we know which column will show the tree
				text : 'Name',
				flex : 2,
				sortable : false,
				editor : {
					xtype : "textfield"
				},
				dataIndex : 'name'
			}, {
				text : 'Value',
				flex : 2,
				sortable : false,
				dataIndex : 'value',
				editor : {
					xtype : "expfield"
				}
			} ]

		});
		this.rawBody = Ext.create('Ext.form.Panel', {
			title : "${tr.Raw Body}",
			tbar : [ "use this to design your own body" ],
			cloesable : false,
			layout : "fit",
			items : [ {
				xtype : 'textareafield',
				name : "JSON_DATA",
				anchor : '100%',
				validator : function(value) {
					try {
						Ext.decode(value);
						return true
					} catch (e) {
						return e + ""
					}

				},
				listeners : {
					change : function(txt, value) {
						try {
							if (txt.isValid()) {
								this.parseJson(value)
							}

						} catch (e) {
							showError("INVALID JSON:" + e)
						}

					},
					scope : this
				}
			} ],
			set : function(txt) {
				var control = this.getForm().findField("JSON_DATA");
				control.suspendEvents();
				control.setValue(txt);
				control.resumeEvents(false);

			},
			setValue : function(txt) {
				this.getForm().findField("JSON_DATA").setValue(txt)
			},
			getValue : function(txt) {
				return this.getForm().findField("JSON_DATA").getValue()
			}
		});
		this.rawResponse = Ext.create('Ext.form.Panel', {
			title : "${tr.Response(optional)}",
			tbar : [ "this json response is used to contribute to expression editor" ],
			cloesable : false,
			layout : "fit",
			items : [ {
				xtype : 'textareafield',
				name : "JSON_DATA",
				anchor : '100%',
				validator : function(value) {
					try {
						Ext.decode(value);
						return true
					} catch (e) {
						return e + ""
					}

				}
			} ],

			setValue : function(txt) {
				this.getForm().findField("JSON_DATA").setValue(txt)
			},
			getValue : function(txt) {
				return this.getForm().findField("JSON_DATA").getValue()
			}
		});

		this.paramsStore = Ext.create('Ext.data.JsonStore', {
			model : 'headermodel'
		});
		this.paramsGridcellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit : 1
		});

		this.paramsGrid = Ext.create('Ext.grid.Panel', {
			title : "${tr.Params}",
			tbar : [ {
				text : '${tr.Add}',
				iconCls : 'icon-new16',
				scope : this,
				handler : function(btn) {
					var g = btn.up("grid")
					var idx = g.getStore().getCount();
					rec = Ext.create('headermodel', {});
					g.getStore().insert(idx, rec);
					g.getView().select(idx);
					this.paramsGridcellEditing.startEditByPosition({
						row : idx,
						column : 1
					});
				}

			}, {
				text : '${tr.Delete}',
				iconCls : 'icon-delete16',
				handler : function(btn) {
					var g = btn.up("grid")
					var selection = g.getSelectionModel().getSelection();
					g.getStore().remove(selection);
				}

			} ],
			forceFit : true,
			sortableColumns : false,
			selType : "checkboxmodel",
			store : this.paramsStore,
			plugins : this.paramsGridcellEditing,
			columns : [ {
				text : "${tr.Key}",
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'key',
				editor : {
					xtype : "textfield"
				}

			}, {
				text : "${tr.Value}",
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'value',
				editor : {
					xtype : "expfield"

				}
			} ],
			getParams : function() {
				var cc = this.getStore().getNewRecords();
				var arrParams = [];
				if (cc.length > 0) {
					for ( var i in cc) {
						var cr = cc[i];
						arrParams.push(cr.data);
					}
				}
				return arrParams;
			}
		});
		this.headerGridcellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit : 1
		});
		this.headersStore = Ext.create('Ext.data.JsonStore', {
			model : 'headermodel'
		});
		this.headerGrid = Ext.create('Ext.grid.Panel', {
			title : "${tr.Headers}",
			tbar : [ {
				text : '${tr.Add}',
				iconCls : 'icon-new16',
				scope : this,
				handler : function(btn) {
					var g = btn.up("grid")
					var idx = g.getStore().getCount();
					rec = Ext.create('headermodel', {});
					g.getStore().insert(idx, rec);
					g.getView().select(idx);
					this.headerGridcellEditing.startEditByPosition({
						row : idx,
						column : 1
					});
				}

			}, {
				text : '${tr.Delete}',
				iconCls : 'icon-delete16',
				handler : function(btn) {
					var g = btn.up("grid")
					var selection = g.getSelectionModel().getSelection();
					g.getStore().remove(selection);
				}

			} ],
			forceFit : true,
			sortableColumns : false,
			selType : "checkboxmodel",
			store : this.headersStore,
			plugins : this.headerGridcellEditing,
			columns : [ {
				text : "${tr.Key}",
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'key',
				editor : {
					xtype : "textfield"
				}

			}, {
				text : "${tr.Value}",
				tdCls : 'search_item_grid wrap-text',
				dataIndex : 'value',
				editor : {
					xtype : "expfield"

				}
			} ],
			getHeaders : function() {
				var cc = this.getStore().getNewRecords();
				var arrHeaders = [];
				if (cc.length > 0) {
					for ( var i in cc) {
						var cr = cc[i];
						arrHeaders.push(cr.data);
					}
				}
				return arrHeaders;
			}
		});
		this.configSection = Ext.create('Ext.tab.Panel', {
			region : 'center',

			defaults : {
				autoScroll : true
			},

			items : [ this.paramsGrid, this.headerGrid, this.bodyPanel, this.rawBody, this.rawResponse ]
		});
		this.win = new Ext.Window({
			closable : true,
			resizable : true,
			maximizable : true,
			collapsible : false,
			closeAction : "hide",
			title : "${tr.Accela Rest Connector}",
			width : 500,
			height : 340,
			autoScroll : false,
			plain : true,
			modal : true,

			bbar : [ '->', {
				text : "${tr.Ok}",
				iconCls : 'icon_save_min',
				scale : 'medium',
				handler : function() {
					try {
						this.setData();
						this.win.close();

					} catch (e) {
						showError(e)
					}
				},
				scope : this
			} ],
			layout : "border",
			items : [ this.form, this.configSection ]

		});
		this.prepareSavedData = function() {
			var ret = {};
			if (!this.form.getForm().isValid()) {
				throw "Please fill mandatory information";
			}

			ret.METHOD = this.form.getMethod();
			ret.URL = this.form.getUrl();
			ret.HEADERS = this.headerGrid.getHeaders();
			ret.PARAMS = this.paramsGrid.getParams();
			if (ret.METHOD != "GET" && ret.METHOD != "HEAD") {
				this.generateJson();
				ret.BODY = Ext.decode(this.rawBody.getValue());
			}
			if (this.rawResponse.getValue() != "") {
				ret.RESPONSE = Ext.decode(this.rawResponse.getValue());
			}

			return Ext.encode(ret);
		}
		this.win.on("move", function(win, x, y, eOpts) {
			if (x < 0 || y < 0) {
				x = x < 0 ? 10 : x;
				y = y < 0 ? 10 : y;
				win.setPosition(x, y, false)
			}
		});
		this.setData = function() {

			var newval = this.prepareSavedData();

			this.setValue(newval);
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				this.record.set(fieldName, newval)
			}
			if (this.ownerCt.field.up().up().xtype == "propertygrid") {
				this.ownerCt.field.up().up().fireEvent("propertychange")
			}

		}
		this.loadData = function() {
			var val = this.getValue();
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				val = this.record.get(fieldName)
			}
			var ret = Ext.decode(val);

			this.form.setMethod(ret.METHOD);
			this.form.setUrl(ret.URL)
			var arr = ret.HEADERS;
			this.headerGrid.getStore().removeAll()
			for ( var x in arr) {
				rec = Ext.create('headermodel', arr[x]);
				this.headerGrid.getStore().insert(x, rec);
			}
			arr = ret.PARAMS;
			this.paramsGrid.getStore().removeAll()
			for ( var x in arr) {
				rec = Ext.create('headermodel', arr[x]);
				this.paramsGrid.getStore().insert(x, rec);
			}

			if (ret.METHOD != "GET" && ret.METHOD != "HEAD") {
				this.parseJson(Ext.encode(ret.BODY))

				this.generateJson();

			}
			this.rawResponse.setValue(Ext.encode(ret.RESPONSE))

		}

		this.on('render', function(c) {
			c.getEl().down("input").dom.setAttribute("readOnly", true)
			c.getEl().on('dblclick', function() {
				this.onTriggerClick()
			}, this);
		});
		this.on('focus', function(component, events) {
			var g = component.up('grid');
			try {
				this.record = g.getSelectionModel().getSelection()[0];
			} catch (e) {

				g = component.up('treepanel');
				try {
					this.record = g.getSelectionModel().getSelection()[0];
				} catch (e) {
					this.record = null;
				}

			}

		}, this);

		this.onTriggerClick = function() {
			this.win.show();

			this.loadData();

		}
	},

	validateOnBlur : true

})

Ext.define('Ext.form.field.soapfield', {
	extend : 'Ext.form.field.Trigger',
	xtype : 'soapfield',
	triggerCls : 'x-form-fx-trigger',
	emptyText : 'Double click for soap params',
	initComponent : function() {
		this.loadedUrl = null;
		this.VALUE = "";
		this.setValue = function(x) {
			this.VALUE = x
		}
		this.getValue = function() {
			return this.VALUE;
		}
		this.addOperationParam = function(parentNode, param, editable, mapping) {
			if (param.children) {
				var pnodedata = Ext.create('keyvaluemodel', {
					leaf : false,
					editable : false,
					name : param.name,
					icon : "icons/toolbar/16/open.png"
				});
				var pnode = parentNode.appendChild(pnodedata);
				for ( var y in param.children) {
					this.addOperationParam(pnode, param.children[y], editable, mapping)
				}

			} else {
				var val = param.value;
				if (mapping && mapping[param.id]) {
					val = mapping[param.id]
				}
				var pnodedata = Ext.create('keyvaluemodel', {
					leaf : true,
					name : param.name,
					value : val,
					editable : editable,
					aaid : param.id,
					icon : "icons/icon16/vouchers.png"
				});
				var pnode = parentNode.appendChild(pnodedata);

			}
		}
		this.onOperationClick = function(panel, record, item, index, e, eOpts) {
			if (record.data.METHOD) {
				var method = record.data.METHOD;
				method.endpoint = record.parentNode.data.text;
				this.loadMethod(record.data.METHOD);
			}
		}
		this.loadMethod = function(method) {

			this.inputForm.setValue(method.input)
			this.outputForm.setValue(method.output)
			var root = this.configPanel.getRootNode();
			root.removeAll();
			root.data.name = method.name;
			root.data.METHOD = method
			var mapping = method.mapping;
			var inparam = Ext.create('keyvaluemodel', {
				leaf : false,
				expanded : true,
				name : "Parameters",
				icon : "icons/icon16/out.png"
			});
			var inp = root.appendChild(inparam);

			var params = method.params;
			for ( var x in params) {
				var param = params[x];
				this.addOperationParam(inp, param, true, mapping);
			}
			var outparams = method.retparams;
			if (outparams && outparams.length == 1) {
				var param = outparams[0];
				var outparam = Ext.create('keyvaluemodel', {
					leaf : false,
					name : "Return(" + param.name + ")",
					icon : "icons/icon16/in.png"
				});
				var outp = root.appendChild(outparam);
				if (param.children) {
					for ( var y in param.children) {
						this.addOperationParam(outp, param.children[y], false, mapping)
					}
				}

			}
		}
		this.webserviceStore = Ext.create('Ext.data.TreeStore', {
			root : {
				text : "Specify url first",
				expanded : true,
				children : []
			}
		});
		this.webserviceTree = Ext.create('Ext.tree.Panel', {
			title : "${tr.Webservice}",
			width : 350,

			rootVisible : true,
			store : this.webserviceStore,
			listeners : {
				itemclick : this.onOperationClick,
				scope : this
			},

			region : "west"
		});
		this.form = Ext.create('Ext.form.Panel', {
			region : "north",
			getUrl : function() {
				return this.getForm().findField("WSDL_URL").getValue();
			},
			setUrl : function(url) {
				this.getForm().findField("WSDL_URL").setValue(url);
			},
			items : [ {
				xtype : 'triggerfield',
				fieldLabel : "${tr.Webservice Url}",
				emptyText : "write webservice url",
				name : "WSDL_URL",
				anchor : '100%',
				triggerCls : 'x-form-search-trigger',
				CONTROL : this,
				listeners : {
					specialkey : function(txt, e) {
						if (13 === e.getKey()) {
							this.onTriggerClick()
						}
					},

				},
				onTriggerClick : function() {

					this.CONTROL.loadWebservice(this.getValue())
				}
			} ]
		});
		this.loadWebservice = function(url) {
			if (this.loadedUrl != url) {

				this.win.getEl().mask("Fetching webservice data...")
				Ext.Ajax.request({
					url : 'ADS',
					params : {
						service : "SOAP",
						action : "getwebservice",
						URL : url
					},

					success : this.loadServices,
					failure : function() {
						showError("ERROR")
						this.win.getEl().unmask();
					},
					scope : this
				});
			}
		}
		this.loadServices = function(res) {
			try {
				this.win.getEl().unmask();
				var selectedMethod = this.configPanel.getRootNode().data.METHOD;
				var selectedEndpoint = null;
				var selectedOperation = null;
				if (selectedMethod && selectedMethod.endpoint) {
					selectedEndpoint = selectedMethod.endpoint;
					selectedOperation = selectedMethod.name;
				}

				var result = eval("[" + res.responseText + "]")[0]
				if (!result.success) {
					throw result.message
				}
				var root = this.webserviceTree.getRootNode();
				var service = result.SERVICE;
				root.removeAll();
				root.data.text = service.name;
				for ( var x in service.endpoints) {
					var endpoint = service.endpoints[x]
					var endpointNode = root.appendChild({
						leaf : false,

						text : endpoint.name,
						icon : "icons/icon16/settings.png"
					});
					if (endpoint.name == selectedEndpoint) {
						endpointNode.expand()
					}
					for ( var x in endpoint.methods) {
						var method = endpoint.methods[x]
						var methodNode = endpointNode.appendChild({
							leaf : true,
							text : method.name,
							icon : "icons/icon16/transfer.png"
						});
						methodNode.data.METHOD = method;
						if (method.name == selectedOperation) {
							this.webserviceTree.getSelectionModel().select(methodNode)

						}
					}

				}
				this.loadedUrl = this.form.getUrl();
			} catch (e) {
				showError(e)
			}
		}
		this.configPanelcellEditing = new Ext.grid.plugin.CellEditing({
			clicksToEdit : 1

		});
		this.configPanelcellEditing.on('beforeedit', function(e, eOpts) {
			var colName = eOpts.field;
			var rowIdx = eOpts.rowIdx;
			var record = eOpts.record;
			var value = eOpts.value;
			return record.data.editable == true;

		}, this);
		this.prepareSavedData = function() {
			var method = this.configPanel.getRootNode().data.METHOD;
			if (!method) {
				throw "Please select a method";
			}
			method.mapping = {};
			var store = this.configPanel.getStore();
			var params = store.getModifiedRecords();
			for ( var x in params) {
				var param = params[x].data;
				if (param.aaid) {
					method.mapping[param.aaid] = param.value;
				}
			}
			//override changed input
			method.input = this.inputForm.getValue();
			return Ext.encode(method)
		}
		this.generateSoapMessage = function() {
			var method = this.configPanel.getRootNode().data.METHOD;
			var store = this.configPanel.getStore();
			var params = store.getModifiedRecords();

			var msg = method.input;
			for ( var x in params) {
				var param = params[x].data;
				if (param.aaid) {
					msg = msg.replace(param.aaid, param.value + "")
				}
			}

			this.inputForm.setValue(method.input)
			this.outputForm.setValue(method.output)
		}
		this.configPanelcellEditing.on('edit', function(e, eOpts) {
			this.generateSoapMessage();
		}, this);
		this.configPanel = Ext.create('Ext.tree.Panel', {
			useArrows : true,
			rootVisible : true,
			multiSelect : false,
			title : "Editor",
			closeable : false,
			singleExpand : false,
			plugins : this.configPanelcellEditing,
			region : "center",
			store : new Ext.data.TreeStore({
				model : 'keyvaluemodel',
				root : {
					name : "Select Operation",
					expanded : true,
					icon : "icons/icon16/transfer.png",
					children : []
				},
				folderSort : true
			}),
			columns : [ {
				xtype : 'treecolumn', //this is so we know which column will show the tree
				text : 'Name',
				flex : 2,
				sortable : false,
				dataIndex : 'name'
			}, {
				text : 'Value',
				flex : 2,
				sortable : false,
				dataIndex : 'value',
				editor : {
					xtype : "expfield"
				}
			} ]

		});
		this.inputForm = Ext.create('Ext.form.Panel', {
			title : "Input",
			cloesable : false,
			layout : "fit",
			items : [ {
				xtype : 'textareafield',
				name : "SOAP_MESSAGE",
				anchor : '100%'
			} ],
			setValue : function(txt) {
				this.getForm().findField("SOAP_MESSAGE").setValue(txt)
			},
			getValue : function(txt) {
				return this.getForm().findField("SOAP_MESSAGE").getValue()
			}
		});
		this.outputForm = Ext.create('Ext.form.Panel', {
			title : "Output",
			cloesable : false,
			layout : "fit",
			items : [ {
				xtype : 'textareafield',
				name : "SOAP_MESSAGE",
				anchor : '100%'
			} ],
			setValue : function(txt) {
				this.getForm().findField("SOAP_MESSAGE").setValue(txt)
			}
		});
		this.configSection = Ext.create('Ext.tab.Panel', {

			region : 'center',
			tabPosition : 'bottom',
			defaults : {
				autoScroll : true
			},

			items : [ this.configPanel, this.inputForm, this.outputForm ]
		});
		this.win = new Ext.Window({
			closable : true,
			resizable : true,
			maximizable : true,
			collapsible : false,
			closeAction : "hide",
			title : "${tr.Accela Soap Webservice}",
			width : 800,
			height : 340,
			autoScroll : false,
			plain : true,
			modal : true,

			bbar : [ '->', {
				text : "${tr.Ok}",
				iconCls : 'icon_save_min',
				scale : 'medium',
				handler : function() {
					this.setData();
					this.win.close();
				},
				scope : this
			} ],
			layout : "border",
			items : [ this.webserviceTree, this.form, this.configSection ]

		});

		this.win.on("move", function(win, x, y, eOpts) {
			if (x < 0 || y < 0) {
				x = x < 0 ? 10 : x;
				y = y < 0 ? 10 : y;
				win.setPosition(x, y, false)
			}
		});
		this.setData = function() {

			var newval = this.prepareSavedData();

			this.setValue(newval);
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				this.record.set(fieldName, newval)
			}
			if (this.ownerCt.field.up().up().xtype == "propertygrid") {
				this.ownerCt.field.up().up().fireEvent("propertychange")
			}
		}
		this.loadData = function() {
			var val = this.getValue();
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				val = this.record.get(fieldName)
			}
			var wsdlfield = this.form.getForm().findField("WSDL_URL");
			wsdlfield.focus()
			if (val != null && val != "") {
				var method = Ext.decode(val);
				var url = method.url;
				wsdlfield.setValue(url);
				this.loadWebservice(url);
				this.loadMethod(method);
			}

		}

		this.on('render', function(c) {
			c.getEl().down("input").dom.setAttribute("readOnly", true)
			c.getEl().on('dblclick', function() {
				this.onTriggerClick()
			}, this);
		});
		this.on('focus', function(component, events) {
			var g = component.up('grid');
			try {
				this.record = g.getSelectionModel().getSelection()[0];
			} catch (e) {

				g = component.up('treepanel');
				try {
					this.record = g.getSelectionModel().getSelection()[0];
				} catch (e) {
					this.record = null;
				}

			}

		}, this);

		this.onTriggerClick = function() {
			this.win.show();

			this.loadData();

		}
	},

	validateOnBlur : true

})

Ext.define('Ext.form.field.htmlfield', {
	extend : 'Ext.form.field.Trigger',
	xtype : 'htmlfield',
	triggerCls : 'x-form-fx-trigger',
	emptyText : 'Double click for editor',
	initComponent : function() {

		this.form = Ext.create('Ext.form.Panel', {
			region : "center",
			layout : 'fit',
			items : [ {
				xtype : 'htmleditor',
				name : "EXPRESSION_VALUE"
			} ]
		});

		this.win = new Ext.Window({
			closable : true,
			resizable : true,
			maximizable : true,
			collapsible : false,
			closeAction : "hide",
			title : "${tr.Accela Html Editor}",
			width : 800,
			height : 340,
			autoScroll : false,
			plain : true,
			modal : true,
			tbar : [ {
				text : "${tr.Clear}",
				iconCls : 'icon-delete16',
				handler : function() {
					this.form.getForm().findField("EXPRESSION_VALUE").setValue("");
				},
				scope : this
			}, {
				text : "${tr.Reset}",
				iconCls : 'icon-restore16',
				handler : function() {
					this.loadData();
				},
				scope : this
			} ],
			bbar : [ '->', {
				text : "${tr.Ok}",
				iconCls : 'icon_save_min',
				scale : 'medium',
				handler : function() {
					this.setData();
					this.win.close();
				},
				scope : this
			} ],
			layout : "border",
			items : [ this.form ]

		});

		this.win.on("move", function(win, x, y, eOpts) {
			if (x < 0 || y < 0) {
				x = x < 0 ? 10 : x;
				y = y < 0 ? 10 : y;
				win.setPosition(x, y, false)
			}
		});
		this.setData = function() {
			var newval = this.form.getForm().findField("EXPRESSION_VALUE").getValue();

			this.setValue(newval);
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				this.record.set(fieldName, newval)
			}
			if (this.ownerCt.field.up().up().xtype == "propertygrid") {
				this.ownerCt.field.up().up().fireEvent("propertychange")
			}
		}
		this.loadData = function() {
			var val = this.getValue();
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				val = this.record.get(fieldName)
			}
			this.form.getForm().findField("EXPRESSION_VALUE").setValue(val);

		}

		this.on('render', function(c) {
			c.getEl().on('dblclick', function() {
				this.onTriggerClick()
			}, this);
		});
		this.on('focus', function(component, events) {
			var g = component.up('grid');
			try {
				this.record = g.getSelectionModel().getSelection()[0];
			} catch (e) {

				g = component.up('treepanel');
				try {
					this.record = g.getSelectionModel().getSelection()[0];
				} catch (e) {
					this.record = null;
				}

			}

		}, this);

		this.onTriggerClick = function() {
			this.win.show();
			this.loadData();

		}
	},

	validateOnBlur : true

})
Ext.define('Ext.form.field.expfield', {
	extend : 'Ext.form.field.Trigger',
	xtype : 'expfield',
	triggerCls : 'x-form-fx-trigger',
	emptyText : 'Double click for builder',
	initComponent : function() {
		this.onTreeItemClick = function(treepanel, record, item, index, e, eOpts) {
			if (record.data.value != null && record.data.value != "") {
				this.insertText(record.data.value)
			}

		}

		this.tree = Ext.create('Ext.ux.TreeFilter', {

			rootVisible : false,
			title : "${tr.Variables and Fields}",
			store : new Ext.create('Ext.data.TreeStore', {
				model : 'CTXModel',
				autoLoad : false,
				proxy : {
					type : 'ajax',
					url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=loadContext',
					reader : {
						type : 'json',
						root : 'children'
					},
					actionMethods : {
						create : 'POST',
						read : 'POST',
						update : 'POST',
						destroy : 'POST'
					}
				},
				root : {
					expanded : true
				},

				folderSort : true,
				listeners : {
					beforeload : function(store, operation) {
						store.RECTYPE = _ruleForm != null ? _ruleForm.getRecordType() : "";
						store.RID = _ruleForm != null ? _ruleForm.getID() : "-1";
						store.EVENT = _ruleForm != null ? _ruleForm.getEvent() : "";
						store.RDATA = _ruleForm != null ? _ruleForm.getData() : "";
						store.ORDER = _ruleForm != null ? _ruleForm.getOrder() : "0";
						if (_ruleForm && _ruleForm.getAgencies().length > 0) {
							store.AGENCY = _ruleForm.getAgencies()[0];
						}

						operation.params = {
							RECTYPE : store.RECTYPE,
							EVENT : store.EVENT,
							RID : store.RID,
							RDATA : store.RDATA,
							ORDER : store.ORDER,
							AGENCY : store.AGENCY
						}
					}
				}
			}),
			listeners : {
				itemclick : this.onTreeItemClick,

				scope : this
			},
			sorters : [ {
				property : 'text',
				direction : 'ASC'
			} ]

		});
		this.libtree = Ext.create('Ext.ux.TreeFilter', {

			rootVisible : false,
			title : "${tr.Libraries and Functions}",
			store : new Ext.create('Ext.data.TreeStore', {
				model : 'CTXLib',
				autoLoad : false,
				proxy : {
					type : 'ajax',
					url : 'ADS?action=execscriptbycode&SCRIPT=EXT_BRE_HANDLEEVENTS&CMD=loadContextLibs',
					reader : {
						type : 'json',
						root : 'children'
					}
				},
				root : {
					expanded : true
				},
				folderSort : true,
			}),
			listeners : {
				itemclick : this.onTreeItemClick,

				scope : this
			},
			sorters : [ {
				property : 'text',
				direction : 'ASC'
			} ]

		});
		this.helperPanel = Ext.create('Ext.panel.Panel', {
			region : "west",
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
			items : [ this.tree, this.libtree ]

		});
		this.form = Ext.create('Ext.panel.Panel', {
			region : "center",
			layout : 'fit',
			items : [ {
				xtype : 'box',
				autoEl : {
					tag : 'iframe',
					src : 'ADS?Template=web/lib/jseditor/editor.htm',
				}
			} ]
		});

		this.win = new Ext.Window({
			closable : true,
			resizable : true,
			maximizable : true,
			collapsible : false,
			closeAction : "hide",
			title : "${tr.Accela Expression Builder}",
			width : 800,
			height : 340,
			autoScroll : false,
			plain : true,
			modal : true,
			tbar : [ {
				text : "${tr.Reload}",
				iconCls : 'icon-refresh16',
				handler : function() {
					this.tree.getStore().reload();
					this.libtree.getStore().reload()
				},
				scope : this
			}, {
				text : "${tr.Clear}",
				iconCls : 'icon-delete16',
				handler : function() {
					if (this.jseditor) {
						this.jseditor.setValue("");
					}
				},
				scope : this
			}, {
				text : "${tr.Reset}",
				iconCls : 'icon-restore16',
				handler : function() {
					this.loadData();
				},
				scope : this
			}, {
				text : "${tr.Check}",
				iconCls : 'icon-validate16',
				handler : function() {
					this.validateCode();
				},
				scope : this
			} ],
			bbar : [ '->', {
				text : "${tr.Ok}",
				iconCls : 'icon_save_min',
				scale : 'medium',
				handler : function() {
					this.setData();
					this.win.close();
				},
				scope : this
			} ],
			layout : "border",
			items : [ this.form, this.helperPanel ]

		});

		this.win.on("move", function(win, x, y, eOpts) {
			if (x < 0 || y < 0) {
				x = x < 0 ? 10 : x;
				y = y < 0 ? 10 : y;
				win.setPosition(x, y, false)
			}
		});
		this.setData = function() {
			var newval = this.jseditor.getValue();

			this.setValue(newval);
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				this.record.set(fieldName, newval)
			}
			if (this.ownerCt.field.up().up().xtype == "propertygrid") {
				this.ownerCt.field.up().up().fireEvent("propertychange")
			}
		}
		this.loadData = function() {
			var val = this.getValue();
			//case in grid
			if (this.ownerCt.field) {
				var fieldName = this.ownerCt.field.name;
				if (!fieldName) {
					fieldName = "value";
				}
				val = this.record.get(fieldName)
			}
			if (this.jseditor) {
				this.jseditor.setValue(val);
			}

		}
		this.validateCode = function() {
			var recType = this.tree.getStore().RECTYPE;
			var event = this.tree.getStore().EVENT;
			var order = _ruleForm != null ? _ruleForm.getOrder() : "0";
			var agency = "";
			if (_ruleForm && _ruleForm.getAgencies().length > 0) {
				agency = _ruleForm.getAgencies()[0];
			}
			var newval = this.jseditor.getValue();
			execScriptByCode("EXT_BRE_HANDLEEVENTS", {
				CMD : "checkExpValidity",
				EVENT : event,
				RECTYPE : recType,
				ORDER : order,
				AGENCY : agency,
				CODE : newval

			}, function(status, response) {
				try {
					handleServerResponse(status, response)
					showInfo("Expression is Valid")
				} catch (e) {
					showError(e)
				}

			})
		}
		this.insertText = function(text) {
			this.jseditor.replaceSelection(text)
		}

		this.on('render', function(c) {
			c.getEl().on('dblclick', function() {
				this.onTriggerClick()
			}, this);
		});
		this.on('focus', function(component, events) {
			var g = component.up('grid');
			try {
				this.record = g.getSelectionModel().getSelection()[0];
			} catch (e) {

				g = component.up('treepanel');
				try {
					this.record = g.getSelectionModel().getSelection()[0];
				} catch (e) {
					this.record = null;
				}

			}

		}, this);
		this.linkEditor = function(editor) {
			this.jseditor = editor;
			this.loadData();
		}

		this.onTriggerClick = function() {
			this.win.show();
			__activeControl = this;
			this.loadData();

			//this.form.getForm().findField("EXPRESSION_VALUE").setValue(this.getValue());
			var RECTYPE = _ruleForm != null ? _ruleForm.getRecordType() : "";
			var EVENT = _ruleForm != null ? _ruleForm.getEvent() : "";

			var ORDER = _ruleForm != null ? _ruleForm.getOrder() : "0";
			var AGENCY = "";
			if (_ruleForm && _ruleForm.getAgencies().length > 0) {
				AGENCY = _ruleForm.getAgencies()[0];
			}
			if (this.tree.getStore().RECTYPE != RECTYPE || this.tree.getStore().EVENT != EVENT || this.tree.getStore().AGENCY != AGENCY || this.tree.getStore().ORDER != ORDER) {
				this.tree.getStore().reload();
				this.libtree.getStore().reload()
			}

			//	this.form.getForm().findField("EXPRESSION_VALUE").setHeight(this.win.getHeight() - 20);

		}
	},

	validateOnBlur : true

})
var __activeControl;
function onEditorLoad(editor) {
	__activeControl.linkEditor(editor)

}