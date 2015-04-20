 /*
	http://host:port/path/SampleService.svc/
		-> service root URL
	Categories(1)/Products
		-> resource path
	?$top=2&$orderby=Name
	 -> query options
 */

 /* First, check if these methods exist */
 if (!String.prototype.format) {
  String.prototype.format = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
	  return typeof args[number] != 'undefined'
		? args[number]
		: match
	  ;
	});
  };
}

if (!String.prototype.trim) {
  (function() {
    // be sure to remove BOM et NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

if (!Date.prototype.toISOString) {
  (function() {
    function pad(number) {
      if ( number < 10 ) {
        return '0' + number;
      }
      return number;
    }
 
    Date.prototype.toISOString = function() {
      return this.getUTCFullYear() +
        '-' + pad( this.getUTCMonth() + 1 ) +
        '-' + pad( this.getUTCDate() ) +
        'T' + pad( this.getUTCHours() ) +
        ':' + pad( this.getUTCMinutes() ) +
        ':' + pad( this.getUTCSeconds() ) +
        '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
        'Z';
    };
  
  }());
}

(function (window) {

"use strict";

function _funcFormat(operator, property, value){
	return '{0}({1}{2}{3})'
		.format(
			operator,
			property === undefined ? '' : typeof property === 'object' && value != null ? _opFormat('', property.toString()) : property === null ? 'null' : property,
			(value !== undefined) && (property !== undefined) ? ',' : '',
			value === undefined ? '' : Array.isArray(value) ? value.join(',') : typeof value === 'object' && value != null ? _opFormat('', value.toString()) : value === null ? 'null' : value
		).trim();
}

function _opFormat(operator, property, value){
	return ((operator.trim() != '' && value !== undefined) ? '{0} {1} {2}' : '{0}{1}{2}').format(
		property === undefined ? '' : typeof property === 'object' && value != null ? _funcFormat('', property.toString()) : property === null ? 'null' : property,
		operator,
		value === undefined ? '' : typeof value === 'object' && value != null ? _funcFormat('', value.toString()) : value === null ? 'null' : value
	);
}

function _clause(delegate, operator, property, value){
	this.operator = operator;
	this.property = property;
	this.value = value;
	this.delegate = delegate;
	
	this.toString = function(){
		return delegate.call(this, operator, property, value);
	};
}

/* Lambda helpers */
function _lambdaRand(){
    return String.fromCharCode(97 + Math.floor(Math.random()*(25-0+1)+0)); // returns lowercase letter from a to z
}

function _lambdaFuncFormat(operator, property, f){
	//$filter=Categories/any(c:contains(c/Name,'ra'))
	var lambda = _lambdaRand();
	
	//var lambdaFilter = new filter(f);
		
	var lambda_clause = new _clause(
		f._clauses[0].delegate, 
		f._clauses[0].operator,
		'{0}/{1}'.format(lambda, f._clauses[0].property), 
		f._clauses[0].value
	);
	
	return '{0}/{1}({2}{3})'
		.format(
			property,
			operator,
			'{0}:'.format(lambda),
			_opFormat('', lambda_clause.toString())
		).trim();
}

function _link(operator, sep){
	this.toString = function(){
		return '{0}{1}{0}'.format(sep === undefined ? ' ' : sep, operator);
	};
}

function _order(ref, properties){
	var settings = {
		properties: Array.isArray(properties) ? properties : properties.split(','),
		order: '',
		toString: function(){
			return '{0} {1}'.format(this.properties.join(','), this.order);
		},
		isset: function(){
			return this.properties.length > 0 ;
		}
	};
	
	this.toString = function(){
		return settings.toString();
	};
	this.asc = function(){
		settings.order = 'asc';
		return ref;
	};
	this.desc = function(){
		settings.order = 'desc';
		return ref;
	};
	this.toggle = function(){
		settings.order = settings.order == 'asc' ? 'desc' : 'asc';
		return ref;
	};
}

function filter(property){
	var that = this;
	
	if(property == undefined)
		property = '';
	
	this._clauses = [];
	
	function add_clause(clearProperty, _clause){
		that._clauses.push(_clause);
		
		if(clearProperty)
			property = '';
		
		return that;
	}
	
	// logical operators
	this.and = function(andProperty){
		add_clause(false, new _link('and'));
		
		if(andProperty instanceof filter)
			add_clause(false, andProperty);
		else
			property = andProperty;
		return this;
	};
	this.or = function(orProperty){
		add_clause(false, new _link('or'));
		
		if(orProperty instanceof filter)
			add_clause(false, orProperty);
		else
			property = orProperty;
		return this;
	};
	this.not = function(notProperty){
		add_clause(false, new _link('not', ''));
		
		if(notProperty instanceof filter)
			add_clause(false, notProperty.group());
		else
			property = notProperty;
		return this;
	};
	
	// OPERATORS
	// comparison operators
	this.equals = function(value){
		return add_clause(false, new _clause(_opFormat, 'eq', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.notEquals = function(value){
		return add_clause(false, new _clause(_opFormat, 'ne', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.greaterThan = function(value){
		return add_clause(false, new _clause(_opFormat, 'gt', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.greaterThanOrEqual = function(value){
		return add_clause(false, new _clause(_opFormat, 'ge', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.lessThan = function(value){
		return add_clause(false, new _clause(_opFormat, 'lt', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.lessThanOrEqual = function(value){
		return add_clause(false, new _clause(_opFormat, 'le', property, typeof value == 'string' ? qodata.literal(value) : value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.has = function(enumerator, value){
		return add_clause(true, new _clause(_opFormat, 'has', property, '{0}{1}'.format(enumerator, qodata.literal(value))));
	};
	// arithmetic operators
	this.add = function(value){
		return add_clause(true, new _clause(_opFormat, 'add', property, value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.sub = function(value){
		return add_clause(true, new _clause(_opFormat, 'sub', property, value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.mul = function(value){
		return add_clause(true, new _clause(_opFormat, 'mul', property, value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.div = function(value){
		return add_clause(true, new _clause(_opFormat, 'div', property, value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	this.mod = function(value){
		return add_clause(true, new _clause(_opFormat, 'mod', property, value instanceof Date ? qodata.defaults.date.format(value) : value));
	};
	
	// FUNCTIONS
	// string functions
	this.contains = function(value){
		return add_clause(false, new _clause(_funcFormat, 'contains', property, typeof value == 'string' ? qodata.literal(value) : value));
	};
	this.endswith = function(value){
		return add_clause(false, new _clause(_funcFormat, 'endswith', property, typeof value == 'string' ? qodata.literal(value) : value));
	};
	this.startswith = function(value){
		return add_clause(false, new _clause(_funcFormat, 'startswith', property, typeof value == 'string' ? qodata.literal(value) : value));
	};
	this.indexof = function(value){
		return add_clause(true, new _clause(_funcFormat, 'indexof', property, typeof value == 'string' ? qodata.literal(value) : value));
	};
	this.substring = function(index1, index2){
		return add_clause(true, new _clause(_funcFormat, 'substring', property, index2 != undefined ? [index1, index2] : index1));
	};
	this.length = function(){
		return add_clause(true, new _clause(_funcFormat, 'length', property));
	};
	this.tolower = function(){
		return add_clause(true, new _clause(_funcFormat, 'tolower', property));
	};
	this.toupper = function(){
		return add_clause(true, new _clause(_funcFormat, 'toupper', property));
	};
	this.trim = function(){
		return add_clause(true, new _clause(_funcFormat, 'trim', property));
	};
	this.concat = function(value){
		return add_clause(true, new _clause(_funcFormat, 'concat', property, value));
	};
	// date functions
	this.year = function(){
		return add_clause(true, new _clause(_funcFormat, 'year', property));
	};
	this.month = function(){
		return add_clause(true, new _clause(_funcFormat, 'month', property));
	};
	this.day = function(){
		return add_clause(true, new _clause(_funcFormat, 'day', property));
	};
	this.hour = function(){
		return add_clause(true, new _clause(_funcFormat, 'hour', property));
	};
	this.minute = function(){
		return add_clause(true, new _clause(_funcFormat, 'minute', property));
	};
	this.second = function(){
		return add_clause(true, new _clause(_funcFormat, 'second', property));
	};
	this.fractionalseconds = function(){
		return add_clause(true, new _clause(_funcFormat, 'fractionalseconds', property));
	};
	this.date = function(){
		return add_clause(true, new _clause(_funcFormat, 'date', property));
	};
	this.time = function(){
		return add_clause(true, new _clause(_funcFormat, 'time', property));
	};
	this.totaloffsetminutes = function(){
		return add_clause(true, new _clause(_funcFormat, 'totaloffsetminutes', property));
	};
	this.mindatetime = function(){
		return add_clause(true, new _clause(_funcFormat, 'mindatetime', property));
	};
	this.maxdatetime = function(){
		return add_clause(true, new _clause(_funcFormat, 'maxdatetime', property));
	};
	this.totalseconds = function(){
		return add_clause(false, new _clause(_funcFormat, 'totalseconds', property));
	};
	this.now = function(){
		return add_clause(true, new _clause(_funcFormat, 'now'));
	};
	// maths functions
	this.round = function(){
		return add_clause(true, new _clause(_funcFormat, 'round', property));
	};
	this.floor = function(){
		return add_clause(true, new _clause(_funcFormat, 'floor', property));
	};
	this.ceiling = function(){
		return add_clause(true, new _clause(_funcFormat, 'ceiling', property));
	};
	// type functions
	this.cast = function(value, valueType){
		if(valueType == undefined)
			return add_clause(true, new _clause(_funcFormat, 'cast', property, value));
		else
			return add_clause(false, new _clause(_funcFormat, 'cast', value, valueType));
	};
	this.isof = function(value, valueType){
		if(valueType == undefined)
			return add_clause(true, new _clause(_funcFormat, 'isof', property, value));
		else
			return add_clause(false, new _clause(_funcFormat, 'isof', value, valueType));
	};
	// other functions
	this.count = function(){
		return add_clause(true, new _clause(_opFormat, '/$count', property));
	};
	// lambda operators
	this.any = function(comparisonFunc){
			if(!comparisonFunc instanceof filter)
				throw 'comparisonFunc must be of type filter';
			return add_clause(false, new _clause(_lambdaFuncFormat, 'any', property, comparisonFunc));
	};
	this.all = function(comparisonFunc){
			if(!comparisonFunc instanceof filter)
				throw 'comparisonFunc must be of type filter';
			return add_clause(false, new _clause(_lambdaFuncFormat, 'all', property, comparisonFunc));
	};
	// geolocation functions
	/*this.geo =
	{ 
		distance: function(value){
			return add_clause(false, new _clause(_funcFormat, 'geo.distance', property, value));
		},
		length : function(){
			return add_clause(true, new _clause(_funcFormat, 'geo.length', property));
		},
		intersects : function(value){
			return add_clause(false, new _clause(_funcFormat, 'geo.intersects', property, value));
		}
	};*/
	
	var groupSettings = {
		group: false,
		isset: function(){
			return this.group;
		}
	};
	this.group = function(grouped){
		groupSettings.group = grouped != undefined ? grouped : true;
		return this;
	};
	
	this.toString = function(){
		var s = '';
		for(var i = 0; i < this._clauses.length; i++){
			var _clause = this._clauses[i];
			
			if(_clause instanceof filter)
				_clause.group(true);
			s += '{0}'.format(_clause.toString());
		}
		return (groupSettings.isset() ? '({0})' : '{0}').format(s);
	};
}

function entity(e){
	this.name = e;
	
	var that = this;
	
	var idSettings = {
		id: null,
		toString: function(){
			return this.isset() ? '({0})'.format(this.id) : '';
		},
		isset: function(){
			return this.id;
		}
	};
	this.single = function(id){
		idSettings.id = typeof id == 'string' ? qodata.literal(id) : id;
		return this;
	};
	this.single.reset = function(){
		idSettings.id = null;
		return this;
	};
	
	var selectSettings = {
		properties: [],
		toString: function(){
			if(this.isset())
				return '$select={0}'.format(this.properties.join(','));
			return '';
		},
		isset: function(){
			return this.properties.length;
		}
	};
	this.select = function(properties){
		selectSettings.properties = Array.isArray(properties) ? properties : properties.split(',');
		return this;
	};
	this.select.reset = function(){
		selectSettings.properties.length = 0;
		return this;
	};
	this.select.remove = function(property){
		if(selectSettings.properties.indexOf(property) > -1)
			selectSettings.properties.splice(selectSettings.properties.indexOf(property), 1);
		return this;
	};
	
	var expandSettings = {
		expands: {},
		set: function(ex){
			var name = (ex instanceof entity) ? ex.name : ex;
			
			if(!this.expands[name])
				this.expands[name] = (ex instanceof entity) ? ex : new entity(ex);
			return this.expands[name];
		},
		toString: function(){
			var parts = [];
			for(var ent in this.expands){
				parts.push(this.expands[ent].toString(true));
			}
			return '$expand={0}'.format(parts.join(','));
		},
		isset: function(){
			return Object.keys(this.expands).length;
		}
	};
	this.expand = function(ex){
		return expandSettings.set(ex);
	};
	this.expand.reset = function(){
		expandSettings.expands = {};
		return this;
	};
	this.expand.remove = function(ex){
		var name = ex instanceof entity ? ex.name : ex;
		
		if(expandSettings.expands[name])
			delete expandSettings.expands[name];
		return this;
	};

	var orderbySettings = {
		properties: {},
		toString: function(){
			if(this.isset()){
				var parts = [];
				for(var prop in this.properties){
					parts.push(this.properties[prop].toString());
				}
				return '$orderby={0}'.format(parts.join(','));
			}
			return '';
		},
		isset: function(){
			return Object.keys(this.properties).length > 0;
		}
	};
	this.orderby = function(properties){
		if(!orderbySettings.properties[properties])
			orderbySettings.properties[properties] = new _order(that, properties);
		return orderbySettings.properties[properties];
	};
	this.orderby.reset = function(){
		orderbySettings.properties = {};
		return this;
	};
	this.orderby.remove = function(properties){
		if(orderbySettings.properties[properties])
			delete orderbySettings.properties[properties];
		return this;
	};
	
	var filterSettings = {
		filter: null,
		toString: function(){
			return this.isset() ? '$filter={0}'.format(this.filter.toString()) : '';
		},
		isset: function(){
			return this.filter != null;
		}
	};
	this.where = function(filter){
		filterSettings.filter = filter;
		return this;
	};
	this.where.reset = function(){
		filterSettings.filter = null;
		return this;
	};
	
	var valueSettings = {
		value: false,
		property: null,
		toString: function(){
			if(this.isset())
				//return '/{0}/$value'.format(this.property);
				return '/$value';
			return '';
		},
		isset: function(){
			return this.value; // this.value && this.property != null;
		}
	};
	this.asValue = function(value){
		valueSettings.value = value === undefined ? true : value;
		//valueSettings.property = property;
		return this;
	}
	this.asValue.reset = function(){
		valueSettings.value = false;
		return this;
	};
	
	var topSettings = {
		top: qodata.defaults.top,
		toString: function(){
			if(this.isset())
				return '$top={0}'.format(this.top);
			return '';
		},
		isset: function(){
			return this.top != undefined && this.top != null;
		}
	};
	this.top = function(n){
		topSettings.top = n;
		return this;
	};
	this.top.reset = function(){
		topSettings.top = qodata.defaults.top;
		return this;
	};
	
	var skipSettings = {
		skip: qodata.defaults.skip,
		toString: function(){
			if(this.isset())
				return '$skip={0}'.format(this.skip);
			return '';
		},
		isset: function(){
			return this.skip != undefined && this.skip != null;
		}
	};
	this.skip = function(n){
		skipSettings.skip = n;
		return this;
	};
	this.skip.reset = function(){
		skipSettings.skip = qodata.defaults.skip;
		return this;
	};
	
	var navSettings = {
		properties: [],
		push: function(propArray){
			// check for same entries
			if(this.properties.join('/') != propArray.join('/'))
				this.properties = this.properties.concat(propArray);
			return that;
		},
		isset: function(){
			return this.properties.length;
		},
		toString : function(){
			if(this.isset())
				return '/{0}'.format(this.properties.join('/'));
			return '';
		}
	};
	this.navigate = function(p){
		return navSettings.push(Array.isArray(p) ? p : p.split('/'));
	};
	this.navigate.reset = function(){
		navSettings.properties.length = 0;
	};
	
	this.toString = function(expandString, asInnerString){
		var parts = [], qs = '';
		
		var expand = expandString === undefined ? false : expandString;
		var inner = asInnerString === undefined ? false : asInnerString;
		
		if(selectSettings.isset())
			parts.push(selectSettings.toString());
		if(orderbySettings.isset())
			parts.push(orderbySettings.toString());
		if(expandSettings.isset())
			parts.push(expandSettings.toString());
		if(filterSettings.isset())
			parts.push(filterSettings.toString());
		if(topSettings.isset())
			parts.push(topSettings.toString());
		if(skipSettings.isset())
			parts.push(skipSettings.toString());
	
		// if(countSettings.isset())
			// parts.push(countSettings.toString());
		// if(formatSettings.isset())
			// parts.push(formatSettings.toString());
		
		if(!parts.length)
			qs = '{0}{1}{2}{3}'.format(this.name, idSettings.toString(), navSettings.toString(), valueSettings.toString());
		else
		{
			if(expand)
				qs = '{0}{1}{2}{3}({4})'.format(this.name, idSettings.toString(), navSettings.toString(), valueSettings.toString(), parts.join(';'));
			else
			{
				if(!inner)
					qs = '{0}{1}{2}{3}?{4}'.format(this.name, idSettings.toString(), navSettings.toString(), valueSettings.toString(), parts.join('&'));
				else
					qs = parts.join('&');
			}
		}
		
		return qs;
	};
};

var q = function(serviceUri){
	var that = this;
	
	this.service = serviceUri;
	
	var countSettings = {
		count: qodata.defaults.count,
		toString: function(){
			if(this.isset())
				return '$count=true';
			return '';
		},
		isset: function(){
			return this.count;
		}
	};
	this.count = function(doCount){
		countSettings.count = doCount == undefined ? true : doCount;
		return that;
	};
	this.count.reset = function(){
		countSettings.count = qodata.defaults.count;
		return that;
	};
	
	var metaSettings = {
		meta: qodata.defaults.metadata,
		toString: function(){
			if(this.isset())
				return '$metadata';
			return '';
		},
		isset: function(){
			return this.meta;
		}	
	};
	this.metadata = function(meta){
		metaSettings.meta = meta != undefined ? meta : true;
		return that;
	};
	this.metadata.reset = function(){
		metaSettings.meta = qodata.defaults.metadata;
		return that;
	};
	
	var formatSettings = {
		formatter: qodata.defaults.format,
		toString: function(){
			if(this.isset())
				return '$format={0}'.format(this.formatter);
			return '';
		},
		isset: function(){
			return this.formatter != null;
		}
	};
	this.format = function(value){
		formatSettings.formatter = value;
		return that;
	};
	this.format.reset = function(){
		formatSettings.formatter = qodata.defaults.format;
		return that;
	};
	
	var entitySettings = {
		entity: null,
		current: null,
		set: function(e, id){
			var name = e instanceof entity ? e.name : e;
			
			if(this.current != name)
				this.entity = e instanceof entity ? e : new entity(name);
			this.current = name;
			if(id !== undefined)
				this.entity.single(id);
			return this.entity;
		},
		isset: function(){
			return this.entity != null;
		}
	};
	this.from = function(entity, id){
		return entitySettings.set(entity, id);
	};
	
	function checkEntity(){
		if(!entitySettings.isset())
			throw 'an entity (from) must be set before calling me...';
	}
	
	this.single = function(id){
		checkEntity();
		entitySettings.entity.single(id);
		
		return that;
	};
	this.single.reset = function(){
		checkEntity();
		entitySettings.entity.single.reset();
		
		return that;
	};
	
	this.select = function(properties){
		checkEntity();
		entitySettings.entity.select(properties);
		
		return that;
	};
	this.select.remove = function(property){
		checkEntity();
		entitySettings.entity.select.remove(property);
		
		return that;
	};
	this.select.reset = function(){
		checkEntity();
		entitySettings.entity.select.reset();
		
		return that;
	};
	
	this.expand = function(entity){
		checkEntity();
		entitySettings.entity.expand(entity);
		
		return that;
	};
	this.expand.remove = function(entity){
		checkEntity();
		return entitySettings.entity.expand.remove(entity);
		
		return that;
	};
	this.expand.reset = function(){
		checkEntity();
		return entitySettings.entity.expand.reset();
		
		return that;
	};
	
	this.orderby = function(properties){
		checkEntity();
		entitySettings.entity.orderby(properties);
		
		return that;
	};
	this.orderby.reset = function(){
		checkEntity();
		entitySettings.entity.orderby.reset();
		
		return that;
	};
	this.orderby.remove = function(properties){
		checkEntity();
		entitySettings.entity.orderby.remove(properties);
		
		return that;
	};
	this.orderby.toggle = function(properties){
		checkEntity();
		entitySettings.entity.orderby(properties).toggle();
		
		return that;
	};
	this.orderby.asc = function(properties){
		checkEntity();
		entitySettings.entity.orderby(properties).asc();
		
		return that;
	};
	this.orderby.desc = function(properties){
		checkEntity();
		entitySettings.entity.orderby(properties).desc();
		
		return that;
	};
	
	this.where = function(filter){
		checkEntity();
		entitySettings.entity.where(filter);
		
		return that;
	};
	this.where.reset = function(){
		checkEntity();
		entitySettings.entity.where.reset();
		
		return that;
	};
	
	this.asValue = function(value){
		checkEntity();
		entitySettings.entity.asValue(value);
		
		return that;
	};
	this.asValue.reset = function(){
		checkEntity();
		entitySettings.entity.asValue.reset();
		
		return that;
	};
	
	this.top = function(n){
		checkEntity();
		entitySettings.entity.top(n);
		
		return that;
	};
	this.top.reset = function(n){
		checkEntity();
		entitySettings.entity.top.reset();
		
		return that;
	};
	
	this.skip = function(n){
		checkEntity();
		entitySettings.entity.skip(n);
		
		return that;
	};
	this.skip.reset = function(){
		checkEntity();
		entitySettings.entity.skip.reset();
		
		return that;
	};
	
	this.navigate = function(properties){
		checkEntity();
		entitySettings.entity.navigate(properties);
		
		return that;
	};
	this.navigate.reset = function(){
		checkEntity();
		entitySettings.entity.navigate.reset();
		
		return that;
	};
	
	function asInnerString(includeEntityName){
		var parts = [];
		
		var inc = includeEntityName === undefined ? true : includeEntityName;
		
		if(entitySettings.isset())
			parts.push(entitySettings.entity.toString(false, inc));
		if(countSettings.isset())
			parts.push(countSettings.toString());
		if(formatSettings.isset())
			parts.push(formatSettings.toString());
		
		return entitySettings.isset() ? parts.join('&') : '';
	}
	this.toString = function()
	{
		return entitySettings.isset() ? '{0}/{1}'.format(this.service, asInnerString(false)) : '{0}/{1}'.format(this.service, metaSettings.toString());
	};
	
	this.asQueryString = function(){
		var s = this.toString();
		
		if(s.indexOf('?'))
			return this.toString().split('?')[1];
		return '';
	}
};

window.qodata = {
	query: function(serviceUri){
		return new q(serviceUri);
	},
	filter : function(property){
		return new filter(property);
	},
	entity : function(name){
		return new entity(name);
	},
	literal: function(s){
		return "'{0}'".format(s);
	},
	datetimeoffset : function(dateProperty, modelType){
		if(modelType == undefined)
			modelType = 'Edm.DateTimeOffset';
		
		return qodata.filter().cast(dateProperty, modelType).toString();
	},
	it: function(){
		return '$it';
	},
	root: function(entity){
		return '$root/{0}'.format(entity);
	},
	defaults: {
		top: undefined,
		skip: undefined,
		count: false,
		metadata: false,
		format: null,
		date : {
			format: function(d){
				return d.toISOString();
			}
		}
	}
};

} (window));
