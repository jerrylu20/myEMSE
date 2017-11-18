/*------------------------------------------------------------------------------------------------------/
| Program		: BRULES.INSTRUCTIONS.js
| Event			: 
|
| Usage			: 
| Notes			: auto generated Record Script by Accela Eclipse Plugin 
| Created by	: SLEIMAN
| Created at	: 24/01/2017 22:24:08
|
/------------------------------------------------------------------------------------------------------*/
//instruction definition
function INSTRUCTION(name, main) {
	this.name = name;
	this.main = main;
}
INSTRUCTION.prototype.getIndexDecrementer = function() {
	return 0;
}
INSTRUCTION.prototype.getFormattedPrefix = function(params, level) {
	var prefix = this.getPrefix(params);
	if (prefix) {
		prefix = INSTRUCTION.levelsToTabs(level) + prefix;
	}
	return prefix;
}
INSTRUCTION.prototype.getFormattedSuffix = function(params, level) {
	var suffix = this.getSuffix(params);
	if (suffix) {
		suffix = INSTRUCTION.levelsToTabs(level) + suffix;
	}
	return suffix;
}
INSTRUCTION.prototype.getPrefix = function(params) {
	return "";
}
INSTRUCTION.prototype.getSuffix = function(params) {
	return "";
}
INSTRUCTION.prototype.getLabel = function(params) {
	return "";
}
INSTRUCTION.prototype.canDelete = function(params) {
	return true;
}
INSTRUCTION.prototype.getAllowedChildren = function() {
	return [];
}
INSTRUCTION.prototype.getForcedChildren = function() {
	return [];
}
INSTRUCTION.prototype.getParams = function() {
	return {};
}
INSTRUCTION.prototype.getButton = function() {
	return {
		text : this.name,
		id_action : this.name,
		id_aa : 'id_menu_add'

	}
}
INSTRUCTION.levelsToTabs = function(level) {
	var t = "";
	for (var x = 0; x < level; x++) {
		t += "\t";
	}
	return t;
}
INSTRUCTION.getConditon = function(conditions) {
	var strCondition = "";

	if (conditions != null && conditions != "") {
		var arrCond = eval(conditions)
		for ( var x in arrCond) {
			var c = arrCond[x]
			var iop = c.INTRAOPERATOR == "=" ? "==" : c.INTRAOPERATOR;

			var op = c.OPERATOR == "OR" ? "||" : "&&";
			if (x == arrCond.length - 1) {
				op = "";
			}
			strCondition += c.PREFIX + c.FIELD + iop + c.VALUE + c.SUFFIX + op
		}
	}
	strCondition = strCondition == "" ? "true" : strCondition;
	return strCondition;
}
INSTRUCTION.TYPES = [];
INSTRUCTION.getType = function(name) {
	var ret = null;
	for ( var x in INSTRUCTION.TYPES) {
		var type = INSTRUCTION.TYPES[x];
		if (type.name == name) {
			ret = type;
			break;
		}
	}

	return ret;
}
INSTRUCTION.listTypes = function(parentType) {
	var ret = [];
	var ptype = INSTRUCTION.getType(parentType);
	if (ptype) {
		var childs = ptype.getAllowedChildren();
		if (childs.length == 0) {
			for ( var y in INSTRUCTION.TYPES) {
				var p = INSTRUCTION.TYPES[y];
				if (p.main) {
					ret.push(p)
				}
			}
		} else {
			for ( var y in childs) {
				var pChild = INSTRUCTION.getType(childs[y]);
				if (pChild) {
					ret.push(pChild);
				}
			}
		}

	} else {
		for ( var y in INSTRUCTION.TYPES) {
			var p = INSTRUCTION.TYPES[y];
			if (p.main) {
				ret.push(p)
			}
		}
	}
	return ret;
}
//IF
function IF() {
	INSTRUCTION.call(this, "IF", true);
}

IF.prototype = Object.create(INSTRUCTION.prototype);
IF.prototype.constructor = IF;
IF.prototype.getAllowedChildren = function() {
	return [ "ELSEIF" ];
}
IF.prototype.getForcedChildren = function() {
	return [ "DO", "ELSE" ];
}
IF.prototype.getLabel = function(params) {
	return INSTRUCTION.getConditon(params.Condition);
}
IF.prototype.getParams = function() {
	return {
		source : {
			Condition : String("")
		},
		config : {
			Condition : {
				displayName : String("Condition"),
				editor : {
					xtype : 'conditionfield'
				}
			}
		}
	}

}
IF.prototype.getPrefix = function(params) {
	return "if(" + INSTRUCTION.getConditon(params.Condition) + ")";
}
IF.prototype.getSuffix = function(params) {
	return "";
}
INSTRUCTION.TYPES.push(new IF())
//DO
function DO() {
	INSTRUCTION.call(this, "DO", false);
}

DO.prototype = Object.create(INSTRUCTION.prototype);
DO.prototype.constructor = DO;
DO.prototype.canDelete = function(params) {
	return false;
}
DO.prototype.getFormattedPrefix = function(params, level) {
	return this.getPrefix(params);
}
DO.prototype.getPrefix = function(params) {
	return "{\n";
}
DO.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new DO())

//ELSE
function ELSE() {
	INSTRUCTION.call(this, "ELSE", false);
}
ELSE.prototype = Object.create(INSTRUCTION.prototype);
ELSE.prototype.constructor = ELSE;
ELSE.prototype.canDelete = function(params) {
	return false;
}
ELSE.prototype.getPrefix = function(params) {
	return "else{\n";
}
ELSE.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new ELSE())

//CMD
function CMD() {
	INSTRUCTION.call(this, "CMD", true);
}

CMD.prototype = Object.create(INSTRUCTION.prototype);
CMD.prototype.constructor = CMD;
CMD.prototype.getAllowedChildren = function() {
	return [ "NONE" ];
}
CMD.prototype.getLabel = function(params) {
	return params.CMD;
}
CMD.prototype.getPrefix = function(params) {
	return "//execute " + params.CMD + "\n";
}
CMD.prototype.getSuffix = function(params) {
	var copy = {}
	for ( var attr in params) {
		if (params.hasOwnProperty(attr) && attr != "CMD" && attr != "ID") {
			copy[attr] = params[attr];
		}

	}

	return "this.executeAction('" + params.ID + "'," + Ext.encode(copy) + ");\n";
}

INSTRUCTION.TYPES.push(new CMD())

//SWITCH
function SWITCH() {
	INSTRUCTION.call(this, "SWITCH", true);
}

SWITCH.prototype = Object.create(INSTRUCTION.prototype);
SWITCH.prototype.constructor = SWITCH;
SWITCH.prototype.getAllowedChildren = function() {
	return [ "CASE" ];
}
SWITCH.prototype.getForcedChildren = function() {
	return [ "CASE", "DEFAULT" ];
}
SWITCH.prototype.getLabel = function(params) {
	return params.Variable;
}
SWITCH.prototype.getParams = function() {
	return {
		source : {
			Variable : String("")
		},
		config : {
			Variable : {
				displayName : String("Variable"),
				editor : {
					xtype : 'expfield'
				}
			}
		}
	}

}
SWITCH.prototype.getPrefix = function(params) {
	return "switch(" + params.Variable + "){\n";
}
SWITCH.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new SWITCH())

//CASE
function CASE() {
	INSTRUCTION.call(this, "CASE", false);
}

CASE.prototype = Object.create(INSTRUCTION.prototype);
CASE.prototype.constructor = CASE;
CASE.prototype.getIndexDecrementer = function() {
	return 1;
}
CASE.prototype.getLabel = function(params) {
	return params.Value;
}
CASE.prototype.getParams = function() {
	return {
		source : {
			Value : String("")
		},
		config : {
			Value : {
				displayName : String("Value"),
				editor : {
					xtype : 'expfield'
				}
			}
		}
	}

}
CASE.prototype.getPrefix = function(params) {
	return "case " + params.Value + ":\n";
}
CASE.prototype.getSuffix = function(params) {
	return "\tbreak;\n";
}
INSTRUCTION.TYPES.push(new CASE())
//default
function DEFAULT() {
	INSTRUCTION.call(this, "DEFAULT", false);
}
DEFAULT.prototype = Object.create(INSTRUCTION.prototype);
DEFAULT.prototype.constructor = DEFAULT;
DEFAULT.prototype.canDelete = function(params) {
	return false;
}
DEFAULT.prototype.getPrefix = function(params) {
	return "default:\n";
}
DEFAULT.prototype.getSuffix = function(params) {
	return "";
}
INSTRUCTION.TYPES.push(new DEFAULT())

//TRY
function TRY() {
	INSTRUCTION.call(this, "TRY", true);
}

TRY.prototype = Object.create(INSTRUCTION.prototype);
TRY.prototype.constructor = TRY;
TRY.prototype.getAllowedChildren = function() {
	return [ "NONE" ];
}
TRY.prototype.getForcedChildren = function() {
	return [ "DO", "CATCH" ];
}
TRY.prototype.getPrefix = function(params) {
	return "try";
}
TRY.prototype.getSuffix = function(params) {
	return "";
}
INSTRUCTION.TYPES.push(new TRY())

//CATCH
function CATCH() {
	INSTRUCTION.call(this, "CATCH", false);
}
CATCH.prototype = Object.create(INSTRUCTION.prototype);
CATCH.prototype.constructor = CATCH;
CATCH.prototype.canDelete = function(params) {
	return false;
}
CATCH.prototype.getPrefix = function(params) {
	return "catch(e){\n";
}
CATCH.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new CATCH())

//THROW
function THROW() {
	INSTRUCTION.call(this, "THROW", true);
}

THROW.prototype = Object.create(INSTRUCTION.prototype);
THROW.prototype.constructor = THROW;
THROW.prototype.getAllowedChildren = function() {
	return [ "NONE" ];
}
THROW.prototype.getLabel = function(params) {
	return params.Error;
}
THROW.prototype.getParams = function() {
	return {
		source : {
			Error : String("")
		},
		config : {
			Error : {
				displayName : String("Error"),
				editor : {
					xtype : 'expfield'
				}
			}
		}
	}

}
THROW.prototype.getPrefix = function(params) {
	return "throw " + params.Error + ";\n";
}
THROW.prototype.getSuffix = function(params) {
	return "";
}
INSTRUCTION.TYPES.push(new THROW())
//CANCEL
function CANCEL() {
	INSTRUCTION.call(this, "CANCEL", true);
}

CANCEL.prototype = Object.create(THROW.prototype);
CANCEL.prototype.constructor = CANCEL;

CANCEL.prototype.getPrefix = function(params) {
	return "this.cancel(" + params.Error + ");\n";
}

INSTRUCTION.TYPES.push(new CANCEL())
//FOR
function LOOP() {
	INSTRUCTION.call(this, "LOOP", true);
}

LOOP.prototype = Object.create(INSTRUCTION.prototype);
LOOP.prototype.constructor = LOOP;

LOOP.prototype.getLabel = function(params) {
	return "I=" + params.Initializer + ";" + INSTRUCTION.getConditon(params.Condition) + ";I=I+" + params.Incrementer;
}
LOOP.prototype.getParams = function() {
	return {
		source : {
			Initializer : 0,
			Condition : String(""),
			Incrementer : 1
		},
		config : {
			Condition : {
				displayName : String("Condition"),
				editor : {
					xtype : 'conditionfield'
				}
			}
		}
	}

}
LOOP.prototype.getPrefix = function(params) {
	return "for(I=" + params.Initializer + ";" + INSTRUCTION.getConditon(params.Condition) + ";I=I+" + params.Incrementer + "){\n";
}
LOOP.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new LOOP())

//ELSEIF
function ELSEIF() {
	INSTRUCTION.call(this, "ELSEIF", false);
}
ELSEIF.prototype = Object.create(INSTRUCTION.prototype);
ELSEIF.prototype.constructor = ELSEIF;
ELSEIF.prototype.canDelete = function(params) {
	return true;
}
ELSEIF.prototype.getIndexDecrementer = function() {
	return 1;
}
ELSEIF.prototype.getLabel = function(params) {
	return INSTRUCTION.getConditon(params.Condition);
}
ELSEIF.prototype.getParams = function() {
	return {
		source : {
			Condition : String("")
		},
		config : {
			Condition : {
				displayName : String("Condition"),
				editor : {
					xtype : 'conditionfield'
				}
			}
		}
	}

}
ELSEIF.prototype.getPrefix = function(params) {
	return "else if(" + INSTRUCTION.getConditon(params.Condition) + "){\n";
}
ELSEIF.prototype.getSuffix = function(params) {
	return "}\n";
}
INSTRUCTION.TYPES.push(new ELSEIF())