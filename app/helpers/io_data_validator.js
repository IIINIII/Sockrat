var config = require('../io_events_config');

var validator = {
    'isValid': function (eventName, data) {
        return this.validate(config[eventName], data);
    },

    'validate': function (conf, data, name = 'data') {
        var isValid = this.typeChecker[this.getTypeFunction(conf.type)](data);

        if (!isValid) {
            console.log(
                '-----------Validator Error-----------'.red +
                '\nObject Path: '.red + name +
                '\nObject: '.red + data +
                '\nExpected: '.red + conf.type +
                '\nGot: '.red + this.getTypeName(data) +
                '\n-------------------------------------'.red
            );
        } else if (conf.props) {
            Object.keys(conf.props).forEach(
                value => {
                    isValid &= this.validate(conf.props[value], data[value], name + '.' + value);
                }
            );
        }

        return isValid;
    },

    // Returns function name for the type's validator
    getTypeFunction: function (type) {
        return 'is' + type.replace(/^\w/, function (chr) {
            return chr.toUpperCase();
        });
    },

    // Returns type of value
    getTypeName: function (value) {
        var type = '';
        Object.keys(this.typeChecker).forEach(
            typeFunc => {
                if (this.typeChecker[typeFunc](value)) {
                    type = typeFunc.toLowerCase().substr(2);
                }
            }
        );
        return type;
    },

    typeChecker: {
        // Returns if a value is a string
        isString: function (value) {
            return typeof value === 'string' || value instanceof String;
        },

        // Returns if a value is really a number
        isNumber: function (value) {
            return typeof value === 'number' && isFinite(value);
        },

        // Returns if a value is an array
        isArray: function (value) {
            return value && typeof value === 'object' && value.constructor === Array;
        },

        // Returns if a value is a function
        isFunction: function (value) {
            return typeof value === 'function';
        },

        // Returns if a value is an object
        isObject: function (value) {
            return value && typeof value === 'object' && value.constructor === Object;
        },

        // Returns if a value is null
        isNull: function (value) {
            return value === null;
        },

        // Returns if a value is undefined
        isUndefined: function (value) {
            return typeof value === 'undefined';
        },

        // Returns if a value is a boolean
        isBoolean: function (value) {
            return typeof value === 'boolean';
        },

        // Returns if a value is a regexp
        isRegExp: function (value) {
            return value && typeof value === 'object' && value.constructor === RegExp;
        },

        // Returns if value is an error object
        isError: function (value) {
            return value instanceof Error && typeof value.message !== 'undefined';
        },

        // Returns if value is a date object
        isDate: function (value) {
            return value instanceof Date;
        },

        // Returns if a Symbol
        isSymbol: function (value) {
            return typeof value === 'symbol';
        }
    }
};

module.exports = validator;