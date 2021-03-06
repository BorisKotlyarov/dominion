module.exports = new (function Repository() {

    this.find = function(criteria, limit, offset){
        let fields = Object.keys(criteria);
        let condition = 'WHERE ' + fields.join(' = ? AND ') +  ' = ?';
        let parameters = fields.map(field => typeof criteria[field] == 'object' ? JSON.stringify(criteria[field]) : criteria[field]);
        let query = `SELECT * FROM ${this.__table__} ${fields.length? condition: ''} LIMIT ${offset}, ${limit}`;

        return this.db.execute(query, parameters)
            .then(([rows, columns]) => rows );
    };

    this.save = function(model){
        model.validate();
        let query;
        let fields = Object.keys(model.__properties__).filter(field => field != "id");
        let parameters = fields.reduce((params, field) => {
            let [key, value] = parametersFormat(model.__properties__[field]);
            params.placeholders.push(`${field} = ${key}`);
            params.values.push(value);
            return params;
        }, {placeholders:[], values:[]});


        if (model.id){
            query = `UPDATE ${this.__table__} SET ${parameters.placeholders.join(',')} WHERE ${this.__table__}.id = ?`;
            parameters.values.push(model.id);
        } else {
            query = `INSERT ${this.__table__} SET ${parameters.placeholders.join(',')}`;
        }

        return this.db.execute(query, parameters.values)
            .then(([result]) => {
                if(result.insertId && model.__proto__.hasOwnProperty('id')){
                    model.id = result.insertId;
                }
                return model;
            });
    };

    this.remove = function(model){
        let condition = 'WHERE ';
        let parameters;
        let fields;

        if(model.__properties__.hasOwnProperty('id')){
            condition += ' `id` = ?';
            parameters = [model.id];
        }else{
            fields = Object.keys(model.__properties__);
            condition += fields.join(' = ? AND ') +  ' = ?';
            parameters = fields.map(field => model.__properties__[field]);
        }
        let query = `DELETE FROM ${this.__table__} ${condition}`;

        return this.db.execute(query, parameters)
            .then(([result]) => result);
    }

});

function parametersFormat(propertyValue) {
    let result = ['?', propertyValue];

    switch (typeof propertyValue) {
        case "object":
            if(propertyValue instanceof Date){
                result = ["FROM_UNIXTIME(?)", Math.round(propertyValue.getTime()/1000)];
            }else if(propertyValue){
                result[1] = JSON.stringify(propertyValue);
            }else{
                result[1] = null;
            }
            break;
        case "undefined":
            result[1] = null;
            break;
    }
    return result;
}