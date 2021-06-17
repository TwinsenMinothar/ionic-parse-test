import { Injectable } from "@angular/core";
import { Parse } from "parse";

Parse.serverURL = "http://192.168.1.69:1337/parse";
Parse.initialize("ID_1");
Parse.masterKey = "KEY_1";

@Injectable({
  providedIn: "root",
})
export class ParseService {
  public currentUser: Parse.User = null; // usuário logado

  public parentUser = null; // usuário pai (se não tiver, é o logado)
  public config: any;

  constructor() {
    this.setUser();
    this.setConfig();
  }

  /**
   * Set the current user
   */
  setUser() {
    this.currentUser = Parse.User.current();

    if (this.currentUser) {
      if (this.currentUser.get("parent")) {
        this.parentUser = this.currentUser.get("parent");
      } else {
        this.parentUser = Parse.User.current();
      }
    }
  }

  /**
   * Returns the current user or null, if is not logged
   * @returns {Parse.User}
   */
  getUser() {
    if (!this.currentUser) {
      this.setUser();
    }

    return this.currentUser;
  }

  /**
   * Returns the Parent user, if exists, or the current otherwise
   * @returns {Parse.User}
   */
  getParentUser() {
    if (!this.currentUser) {
      this.setUser();
    }

    return this.parentUser;
  }

  /**
   * Returns true if the current user is an Parent User
   * @returns {boolean}
   */
  isParent() {
    if (this.currentUser && this.parentUser) {
      return this.currentUser.id == this.parentUser.id;
    } else {
      return false;
    }
  }

  /**
   * Do the login with email and password
   * @params {string} email
   * @params {string} password
   * @returns {Parse.User} The logged user
   */
  async logIn(email, password) {
    try {
      let user = await Parse.User.logIn(email, password);

      this.setUser();

      return this.currentUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register the user
   * @param {object} params -  In the format {name: 'jon doe', email: 'email@email.com', password: '123', .... }
   * @returns {Parse.User} The new logged user
   */
  async signUp(params) {
    let user = new Parse.User();
    console.log(user);
    for (let x in params) {
      user.set(x, params[x]);
    }
    console.log(user);

    try {
      await user.signUp();
      this.currentUser = Parse.User.current();
      return this.currentUser;
      // Hooray! Let them use the app now.
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log the user out from parse
   * @returns {null}
   */
  async logOut() {
    let user = await Parse.User.logOut();
    this.currentUser = null;
    this.parentUser = null;
    return user;
  }

  /**
   * Send an email to reset the user's password
   * @param {string} email - The user email
   * @returns {boolean} If the request was successful
   */
  async resetPass(email) {
    return await Parse.User.requestPasswordReset(email);
  }

  /**
   * Update the current user's informations
   * @param {object} params - The json object with the params, like: {name: 'jon doe', username: 'jondoe', email: 'email@email.com', password: '123'}
   * @returns {Parse.User} The current logged user, with the new information
   */
  async updateUser(params) {
    for (let x in params) {
      this.currentUser.set(x, params[x]);
    }

    try {
      return await this.currentUser.save(null, { useMasterKey: true });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create an Object on Parse
   * @param {string} table - The Class name
   * @param {object} params - The json object with the params, like: {name: 'shoe', price: 10.55, units:5, ... }
   * @returns {Parse.Object} The new created Object
   */
  async saveItem(table, params) {
    let ItemToSave = Parse.Object.extend(table);
    let itemToSave = new ItemToSave();

    for (let x in params) {
      itemToSave.set(x, params[x]);
    }

    return await itemToSave.save(null, { useMasterKey: true });
  }

  /**
   * Get an Object from Parse by the Id
   * @param {string} table - The Class name
   * @param {number} itemId - The objectId of the object
   * @returns {Parse.Object} The requested object or null
   */
  async getItem(table, itemId) {
    let ItemObj = Parse.Object.extend(table);
    let query = new Parse.Query(ItemObj);
    query.include("*");
    return await query.get(itemId);
  }

  /**
   * Get an Object from Parse with multiples params
   * @param {string} table - The Class name
   * @param {array[array]} params - Array of arrays, when the inner arrays are in the format: ['column', 'operator' (=, !=, <, >, <=, >=), value]
   * @example [['name', '=', 'shoe'], ['price', '=', 10.55]]
   * @param {string} orderBy - the ordering of the results (ascending by default)
   * @param {boolean} descending - if the result's order is descending instead of the default
   * @param {string} include - the pointers that you wanna included in the result object. eg 'categories' or '*'
   * @returns {Parse.Object} The requested object or null
   */
  async getWhere(
    table,
    params = null,
    orderBy = null,
    descending = null,
    include = null
  ) {
    let query = new Parse.Query(table);
    if (params) {
      params.forEach((param) => {
        switch (param[1]) {
          case "=":
            query.equalTo(param[0], param[2]);
            break;
          case "!=":
            query.notEqualTo(param[0], param[2]);
            break;
          case "<":
            query.lessThan(param[0], param[2]);
            break;
          case ">":
            query.greaterThan(param[0], param[2]);
            break;
          case "<=":
            query.lessThanOrEqualTo(param[0], param[2]);
            break;
          case ">=":
            query.greaterThanOrEqualTo(param[0], param[2]);
            break;
        }
      });
    }
    if (descending && orderBy) {
      query.descending(orderBy);
    } else if (orderBy) {
      query.ascending(orderBy);
    }

    if (include) {
      query.include(include);
    }

    return await query.first();
  }

  /**
   * Update a Parse Object
   * @param {Parse.Object} item - The Item be update (not the id)
   * @param {object} params - The json object with the params, like: {name: 'shoe', price: 10.55, units:5, ... }
   * @returns {Parse.Object} The saved Object
   */
  async updateItem(item, params) {
    for (let x in params) {
      item.set(x, params[x]);
    }

    return await item.save(null, { useMasterKey: true });
  }

  /**
   * Delete an Object on Parse
   * @param {Parse.Object} item - The Item be destroyed (not the id)
   * @returns {boolean} If the operation was successful
   */
  async deleteItem(item) {
    return await item.destroy({ useMasterKey: true });
  }

  /**
   * Get a query results from Parse with multiples params
   * @param {string} table - The Class name
   * @param {array[array]} params - Array of arrays, when the inner arrays are in the format: ['column', 'opetator' (=, !=, <, >, <=, >=), value]
   * @example [['name', '=', 'shoe'], ['price', '=', 10.55]]
   * @param {string} orderBy - the ordering of the results (ascending by default)
   * @param {boolean} descending - if the result's order is descending instead of the default
   * @param {number} skip - the number of rows to skip
   * @param {number} limit - the max number of rows in the result
   * @param {string} include - the pointers that you wanna included in the result object. eg 'categories' or '*'
   * @param {string} distinct - only results with distinct results for this column
   * @returns {array} The results from the query
   */
  async getList(
    table,
    params = null,
    orderBy = null,
    descending = null,
    skip = null,
    limit = null,
    include = null,
    distinct = null
  ) {
    let query = new Parse.Query(table);
    if (params) {
      params.forEach((param) => {
        switch (param[1]) {
          case "=":
            query.equalTo(param[0], param[2]);
            break;
          case "!=":
            query.notEqualTo(param[0], param[2]);
            break;
          case "<":
            query.lessThan(param[0], param[2]);
            break;
          case ">":
            query.greaterThan(param[0], param[2]);
            break;
          case "<=":
            query.lessThanOrEqualTo(param[0], param[2]);
            break;
          case ">=":
            query.greaterThanOrEqualTo(param[0], param[2]);
            break;
        }
      });
    }

    if (descending && orderBy) {
      query.descending(orderBy);
    } else if (orderBy) {
      query.ascending(orderBy);
    }

    if (include) {
      query.include(include);
    }

    if (skip) {
      query.skip(skip);
    }
    if (limit) {
      query.limit(limit);
    }

    if (distinct) {
      return await query.distinct(distinct);
    } else {
      return await query.find({ useMasterKey: true });
    }
  }

  /**
   * get the number of items on this Class
   * @param {string} table - The Class name
   * @param {array[array]} params - Array of arrays, when the inner arrays are in the format: ['column', 'opetator' (=, !=, <, >, <=, >=), value]
   * @example [['name', '=', 'shoe'], ['price', '=', 10.55]]
   * @returns {number} Number of items
   */
  async count(table, params = null) {
    let query = new Parse.Query(table);
    if (params) {
      params.forEach((param) => {
        switch (param[1]) {
          case "=":
            query.equalTo(param[0], param[2]);
            break;
          case "!=":
            query.notEqualTo(param[0], param[2]);
            break;
          case "<":
            query.lessThan(param[0], param[2]);
            break;
          case ">":
            query.greaterThan(param[0], param[2]);
            break;
          case "<=":
            query.lessThanOrEqualTo(param[0], param[2]);
            break;
          case ">=":
            query.greaterThanOrEqualTo(param[0], param[2]);
            break;
        }
      });
    }

    return await query.count({ useMasterKey: true });
  }

  /**
   * Get a query results from a relation on a Object
   * @param {Parse.Object} item - The parent object
   * @param {string} relation - The relation column
   * @param {string} orderBy - the ordering of the results (ascending by default)
   * @param {boolean} descending - if the result's order is descending instead of the default
   * @returns {array} The results from the query
   */
  async getRelation(item, relation, orderBy = null, descending = null) {
    let nrelation = item.relation(relation);

    let query = nrelation.query();
    if (descending && orderBy) {
      query.descending(orderBy);
    } else if (orderBy) {
      query.ascending(orderBy);
    }

    return await query.find();
  }

  /**
   * Add an Object to a relation column of a Object
   * @param {Parse.Object} item - The parent object
   * @param {string} relation - The relation column
   * @param {Parse.Object} relationItem - The Object to be added on the relation
   * @returns {array} The success of the operation
   */
  async putRelation(item, relation, relationItem) {
    try {
      let nrelation = item.relation(relation);
      nrelation.add(relationItem);
      item.save();
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Remove an Object from a relation column of a Object
   * @param {Parse.Object} item - The parent object
   * @param {string} relation - The relation column
   * @param {Parse.Object} relationItem - The Object to be removed of the relation
   * @returns {array} The success of the operation
   */
  async removeRelation(item, relation, relationItem) {
    try {
      let nrelation = item.relation(relation);
      nrelation.remove(relationItem);
      await item.save();
      return true;
    } catch (e) {
      throw e;
    }
  }

  /**
   * Get the Parse Config
   * @returns {object}  object with the configurationattributes
   */
  async getConfig() {
    let conf = await Parse.Config.get();
    return conf.attributes;
  }

  async setConfig() {
    return await this.getConfig().then((config) => {
      this.config = config;
      // console.log('config= ' + JSON.stringify(config));
    });
  }

  /**
   * Subscribe for livequery on a Object
   * @param {string} table - The Class name
   * @param {string} itemId - The id of the item to be observed
   * @returns {subscription} The parse subscription
   */
  async subscribeItem(table, itemId) {
    let query = new Parse.Query(table);
    query.equalTo("objectId", itemId);
    return await query.subscribe();
  }

  /**
   * Subscribe for livequery on a Class
   * @param {string} table - The Class name
   * @param {array[array]} params - Array of arrays, when the inner arrays are in the format: ['column', 'opetator' (=, !=, <, >, <=, >=), value]
   * @example [['name', '=', 'shoe'], ['price', '=', 10.55]]
   * @param {string} orderBy - the ordering of the results (ascending by default)
   * @param {boolean} descending - if the result's order is descending instead of the default
   * @param {number} skip - the number of rows to skip
   * @param {number} limit - the max number of rows in the result
   * @param {string} include - the pointers that you wanna included in the result object. eg 'categories' or '*'
   * @param {string} distinct - only results with distinct results for this column
   * @returns {subscription} The parse subscription
   */
  async subscribeQuery(
    table,
    params = null,
    orderBy = null,
    descending = null,
    skip = null,
    limit = null,
    include = null,
    distinct = null
  ) {
    let query = new Parse.Query(table);
    if (params) {
      params.forEach((param) => {
        switch (param[1]) {
          case "=":
            query.equalTo(param[0], param[2]);
            break;
          case "!=":
            query.notEqualTo(param[0], param[2]);
            break;
          case "<":
            query.lessThan(param[0], param[2]);
            break;
          case ">":
            query.greaterThan(param[0], param[2]);
            break;
          case "<=":
            query.lessThanOrEqualTo(param[0], param[2]);
            break;
          case ">=":
            query.greaterThanOrEqualTo(param[0], param[2]);
            break;
        }
      });
    }

    if (descending && orderBy) {
      query.descending(orderBy);
    } else if (orderBy) {
      query.ascending(orderBy);
    }

    if (include) {
      query.include(include);
    }

    if (distinct) {
      query.distinct(distinct);
    }

    if (skip) {
      query.skip(skip);
    }
    if (limit) {
      query.limit(limit);
    }

    return await query.subscribe();
  }

  /**
   * Stop the subscription for livequery on a query or item
   * @param {subscription} subscription - The parse subscription
   * @returns {boolean} The success of the operation
   */
  async unsubscribe(subscription) {
    if (subscription) {
      return await subscription.unsubscribe();
    }
  }

  /**
   * Create an Parse File for a image
   * @param {string} name - The name of the file
   * @param {string} base64 - The content of the file in base64 encode
   * @returns {Parse.Object} The created file
   */
  async saveFile(name, base64) {
    const file = new Parse.File(name, { base64 });
    return await file.save();
  }

  /**
   * Calls a Cloud Function
   * @param {string} functionName - The name of the Cloud Function
   * @param {Object} params - the params for the Cloud Function
   * @returns {any} Whatever the Cloud Function returns
   */
  async cloudFunction(functionName, params) {
    return await Parse.Cloud.run(functionName, params);
  }
}
