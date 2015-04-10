# qodata
A simple pure JavaScript library, very deeply inspired by joData, to help you query OData V4 services.
Almost all functions are chainable.

Thanx to the author of joData.

## Note
I am not a JavaScript killer, so feel free to help me make it better as in performance, bugs, ...

Feel free to fork, use, pull fixes and improvements!

Despite bugs might be present, this version is fully usable.

# Getting started

## Creating new query
Create a new qodata query by passing the service root uri

    var myQuery = qodata.query('https://my.com/api');
        
## toString
Get the query in OData format by calling the toString method

    myQuery.toString();
        
## asQueryString
Get the query string part by calling the asQueryString method

    myQuery.asQueryString();
        
## Default parameters
Set default values for all your queries

### PROPERTY Top (defaults to undefined)

    qodata.defaults.top = 60;
        
### PROPERTY Skip (defaults to undefined)

    qodata.defaults.skip = 10;
        
### PROPERTY Count (defaults to false)

    qodata.defaults.count = true;
        
### PROPERTY metadata (defaults to false)

    qodata.defaults.metadata = true;
        
### PROPERTY format (defaults to null)

    qodata.defaults.format = 'json';


## The qodata namespace

### FUNCTION query
Call this method to instanciate a new query

    var myQuery = qodata.query('https://my.com/api');
        
### FUNCTION filter
Call this method to instanciate a new filter

    var filter = qodata.filter('FirstName').equals('John');
        
### FUNCTION entity
Call this method to instanciate a new entity

Entities CAN be used as parameter of the 'from' method.

Entities CAN be used as parameter of the 'expand' method.


    var entity = qodata.entity('Customers');
    myQuery.from(entity);
    
### FUNCTION literal
Forces qodata to add quotes around the parameter in the generated OData query

    myQuery.where('CustomerID').contains(qodata.literal(10));
    
## The query namespace

### PROPERTY service
Get the root uri by getting this property

    myQuery.service; // -> https://my.com/api
    
### FUNCTION count
Allows clients to request a count of the matching resources included with the resources in the response

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398166

#### switch on the count option

    myQuery.count();
    
##### optional parameter
this syntax equals the one above

    myQuery.count(true);
    
#### switch off the count option

    myQuery.count(false);
    
#### reset to the default value

    myQuery.count.reset();
    
### FUNCTION format
Allows clients to request a response in a particular format and is useful for clients without access to request headers for standard content-type negotiation

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398169

#### switch on the format option

    myQuery.format('json');
    
#### reset the default value

    myQuery.format.reset();
    
### FUNCTION from
Sets the resource to query

This method is a singleton : each time you call it, the previous resource path (entity) is replaced

* param1: mandatory, the entity to set as resource. Can be a string or an qodata.entity instance
* param2: optional, the id of the resource to get

#### passing a string

    myQuery.from('Customers');
    myQuery.from('Customers', 1);
    
#### passing an entity

    var entity = qodata.entity('Customers');
    myQuery.from(entity);
    
### FUNCTION single (shortcut to the entity single function)
Sets the id of the resource to get

    myQuery.from('Customers').single(1); // is equal to myQuery.from('Customers', 1);
    
#### reset single

    myQuery.from('Customers').single.reset();
    
### FUNCTION select (shortcut to the entity select function)
 Allows clients to requests a specific set of properties for each entity or complex type
 
 See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398163
 
#### selecting properties
* param 1: mandatory, can be a comma separated string or an array

##### selecting properties with a string

    myQuery.select('FirstName,LastName');
    
##### selecting properties with an array

    myQuery.select(['FirstName', 'LastName']);
    
#### remove properties from the select clause

    myQuery.select.remove('LastName');
    
#### remove all properties from the select clause

    myQuery.select.reset();
    
### FUNCTION expand (!)  (shortcut to the entity expand function)
Specifies the related resources to be included in line with retrieved resources

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398162

* param 1: mandatory, can be a string or an qodata.entity

In fact, expand is internally implemented as an entity
So it lets you work on the expanded property like on an entity

    var entity = qodata.entity('Orders').select('Price, Discount').orderby('Discount').asc();
    myQuery.expand(entity);
    
#### reset expand
Clears all

    myQuery.expand.reset();
    
#### remove expand
Removes an expanded property

    myQuery.expand.remove('Orders');
    myQuery.expand.remove(entity);
    
### FUNCTION orderby (shortcut to the entity orderby function)
Allows clients to request resources in a particular order

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398164

param 1: can be a coma separated string or an array

    myQuery.orderby('FirstName, LastName');
    myQuery.orderby(['FirstName', 'LastName']);
    
#### remove an order property

    myQuery.orderby.remove('FirstName');
    
#### clear all orderby properties

    myQuery.orderby.reset();
    
#### force asc order

    myQuery.orderby('FirstName').asc(); // sets (if not already setted) the sort on LastName, then sets in asc order
    myQuery.orderby.asc('FirstName');// Sets the asc order on an already setted orderby property
    
#### force desc order

    myQuery.orderby('LastName').desc(); // sets (if not already setted) the sort on LastName, then sets in desc order
    myQuery.orderby.desc('LastName'); // Sets the desc order on an already setted orderby property
    
#### toggle order

    myQuery.orderby('FirstName').toggle(); // sets (if not already setted) the sort on LastName, then toggles order
    myQuery.orderby.toggle('LastName'); // Toggles order on an already setted property
    
### FUNCTION where (shortcut to the entity where function)
Allows clients to filter a collection of resources that are addressed by a request URL. The expression is evaluated for each resource in the collection, and only items where the expression evaluates to true are included in the response

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398094

param1: filter to apply, its type is qodata.filter

    myQuery.where(
      qodata.filter('FirstName').contains('John')
        .or('LastName').equals('Doe')
    );
    
# TO BE CONTINUED...#
