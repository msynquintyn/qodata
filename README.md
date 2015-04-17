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

### FUNCTION date.format (defaults to toISOString())
Here, you can define the default format qodata will take to render dates in filter operators.

The default function returns an ISO String. You can specify you prefered format, the only constrainst is that it must be compatible with your OData implementation date filters.

For example, you can include moment.js and redefine this function.

	qodata.defaults.date.format = function(d) { return moment(d).format('DD-MM-YYYY'); }

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
    
### FUNCTION expand (shortcut to the entity expand function)
Specifies the related resources to be included in line with retrieved resources

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398162

As of shortcut to the entity function, expand is 'chainable'.
As of the entity function (see chapter 'entity'), calling the expand function returns the expanded entity, so chaining functions acts on the expanded entity...

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
    
### FUNCTION asValue (shortcut to the entity asValue function)
To address the raw value of a primitive property

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398086

#### switch on value

    myQuery.from('Customers(1)/FirstName').asValue();
    
##### optional parameter
This syntax equals the one above

    myQuery.from('Customers(1)/FirstName').asValue(true);
    
#### switch off value

    myQuery.from('Customers(1)/FirstName').asValue(false);
    // or
    myQuery.from('Customers'(1)/FirstName').asValue.reset();
    
### FUNCTION top & skip (shortcuts to the entity functions)
The top system query option requests the number of items in the queried collection to be included in the result. The skip query option requests the number of items in the queried collection that are to be skipped and not included in the result

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398165

#### Setting top & skip

    myQuery.top(40);
    myQuery.skip(10);
    
#### reset to default values
Resets to qodata.defaults values

    myQuery.top.reset();
    myQuery.skip.reset();
    
### FUNCTION navigate (shortcut to the entity navigate function)
See 'path expressions' http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398158

param1 : mandatory, can be a '/' separated string or an array

#### Setting a navigation property

    myQuery.from('Customers').navigate('Orders').navigate('Product')
    // equals to
    myQuery.from('Customers').navigate('Orders/Product');
    // equals to
    myQuery.from('Customers').navigate(['Orders', 'Product']);
    
#### remove navigation properties

    myQuery.from('Customers').navigate.reset();
    
## The entity namespace
The qodata.entity lets you work with the where and expand functions

### Creating new entity

    var customers = qodata.entity('Customers');
    // or selecting a customer by it's ID
    var customers = qodata.entity('Customers', 10); // equals to e.single(10), see below
    
#### PROPERTY name
You can get the entity name by calling this property

    customers.name // -> Customers
    
#### FUNCTION single
Lets you select ONE entity by setting it's id

    customers.single(10); // 10 is the Customer's ID
    
##### reset the entity's selection by ID

    customers.single.reset();
    
#### FUNCTION select
Allows clients to requests a specific set of properties for each entity or complex type

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398163

param 1 : mandatory, can be a comma separated string or an array

        customers.select('FirstName,LastName');
        customers.select(['BirthDate', 'City Of Birth']);
        
##### remove selected properties

        customers.select.remove('FirstName');
        
##### remove all setected properties

        customers.select.reset();
        
#### FUNCTION expand
Specifies the related resources to be included in line with retrieved resources

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398162

param 1 : mandatory, can be a string (in this case qodata internally creates an entity) or an entity

This method returns the expanded entity, so chaining functions acts on the returned entity (the expanded property)

        // expand with a string
        customers.expand('Orders').orderby('Price').desc(); // chained orderby function acts on the expanded property 'Orders')
        // expand with an entity
        var orders = qodata.entity('Orders').orderby('Price').asc();
        customers.expand(orders);
        
##### remove expanded property

        customers.expand.remove('Orders');
        // or
        customers.expand.remvoe(orders);
        
##### remove all expanded properties

        customers.expand.reset();
        
#### FUNCTION orderby
Allows clients to request resources in a particular order

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398164

Unlike the qodata.query.orderby shortcut, this method MUST be followed by one of the asc() or desc() methods

param 1: can be a coma separated string or an array

        customers.orderby('FirstName').asc();
        customers.orderby('FirstName').desc();
        
##### toggle orderby

        customers.orderby('FirstName').toggle();
        customers.orderby.toggle('FirstName');
        
##### force an orderby on already setted properties

        customers.orderby.asc('FirstName');
        customers.orderby.desc('FirstName');
        
##### remove an orderby property

        customers.orderby.remove('FirstName');
        
#### remove all orderby properties

        customers.orderby.reset();
        
#### FUNCTION where
Allows clients to filter a collection of resources that are addressed by a request URL

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398094

This method is a singleton, that is eveytime you call this method, the previous filter is replaced

##### creating a filter for the where function

        var filter = qodata.filter('FirstName').equals('John');
        
        customers.where(filter);
        
##### remove a filter

        customers.where.reset();
        

### FUNCTION asValue
To address the raw value of a primitive property

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398086

#### switch on value

    customers.single(1).navigate('FirstName').asValue();
    
##### optional parameter
This syntax equals the one above

    customers.single(1).navigate('FirstName').asValue(true);
    
#### switch off value

    customers.single(1).navigate('FirstName').asValue(false);
    // or
    customers.single(1).navigate('FirstName').asValue.reset();
    
### FUNCTION top & skip
The top system query option requests the number of items in the queried collection to be included in the result. The skip query option requests the number of items in the queried collection that are to be skipped and not included in the result

See http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398165

#### Setting top & skip

    customers.top(40);
    customers.skip(10);
    
#### reset to default values
Resets to qodata.defaults values

    customers.top.reset();
    customers.skip.reset();
    
### FUNCTION navigate
See 'path expressions' http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part2-url-conventions/odata-v4.0-errata02-os-part2-url-conventions-complete.html#_Toc406398158

param1 : mandatory, can be a '/' separated string or an array

#### Setting a navigation property

    customers.navigate('Orders').navigate('Product')
    // equals to
    customers.navigate('Orders/Product');
    // equals to
    customers.navigate(['Orders', 'Product']);
    
#### remove navigation properties

    customers.navigate.reset();
    
### The filter namespace
qodata filters are used in the qodata.query.where and qodata.entity.where functions

Args passed to the filter operators / functions can be simple objects or an instance of a filter

#### creating a filter

        var filter = qodata.filter('FirstName');
        
#### comparison operators

##### equals

        filter.equals('John');
        
##### notEquals

        filter.notEquals('Doe');
        
##### greaterThan / greaterThanOrEqual

        var filter = qodata.filter('Price');
        
        filter.greaterThan(199);
        filter.greaterThanOrEqual(200);
        
##### lessThan / lessThanOrEqual

        filter.lessThan(501);
        filter.lessThanOrEqual(500);
        
##### has
Returns true if the right hand operand is an enumeration value whose flag(s) are set on the left operand

        var filter = qodata.filter('Type');
        
        filter.has('CustomerType', 'Super');
        
#### arithmetic operators

##### add

        var filter = qodata.filter('Price').add(50).equals(200);

##### sub

        var filter = qodata.filter('Price').sub(50).equals(150);

##### mul

        var filter = qodata.filter('Price').mul(2).equals(200);

##### div

        var filter = qodata.filter('Price').div(2).equals(100);

##### mod

        var filter = qodata.filter('Price').mod(5).equals(0);
        
#### string functions

        var filter = qodata.filter('FirstName');
        
##### contains

        filter.contains('John');

##### endswith

        filter.endswith('hn')

##### startswith

        filter.startswith('Jo');

##### indexof

        filter.indexof('J').equals(0);

##### substring

        // selecting from char 2 to the end of the string
        filter.substring(2).equals('ohn');
        
        // selecting 2 chars from the second char.
        filter.substring(2, 2).equals('oh');

##### length
        

        filter.length().equals(4);

##### tolower

        filter.tolower().equals('john');
        
##### toupper

        filter.toupper().equals('JOHN');

##### trim

        filter.trim().equals('John');

##### concat

        filter.concat(qodata.literal(' Junior')).equals('John Junior');
        filter.concat('LastName').equals('John Doe');
        
#### date functions

        var filter = qodata.filter('BirthDate');
        
##### year, month, day

        filter.year().equals(1980);
        filter.month().equals(12);
        filter.day().equals(01);
        
##### hour, minute, second, fractionalseconds

        filter.hour().equals(23);
        filter.minute().equals(30);
        filter.second().equals(30);
        filter.fractionalseconds.equals(230);
        
##### date, time

        filter.date().equals(dd/mm/yyyy);
        filter.time().equals(hh:mm:ss);
        
##### other

        filter.totaloffsetminutes().equals(....);
        filter.mindatetime().equals(....);
        filter.maxdatetime().equals(....);
        filter.totalseconds().equals(....);
        filter.now().equals(....);
        
#### mathematics functions

        var filter = qodata.filter('Amount');
        
##### round

        filter.round().equals(10);

##### floor

        filter.floor().equals(10);

##### ceiling

        filter.ceiling().equals(10);
        
#### type functions : cast & isof

        filter.cast('int').equals(10);
        filter.isof('decimal').equals(true);
        
        // equals to
        qodata.filter().cast('Price', 'int').equals(10);
        qodata.filter().isof('Price', 'decimal').equals(true);
        
#### count

        var orders = myQuery.from('Orders');
        var filter = orders.filter('Products');
        
        filter.count().greaterThan(5);
        
#### any & all
param1: MUST be a filter

        var filter = qodata.filter('Products');
        
        filter.any(qodata.filter('Quantity').greaterThan(20));
        filter.all(qodata.filter('Quantity').greaterThan(20));
        
#### grouping filters

Setting a filter in a filter automatically groups the inner one

        var filter = qodata.filter('FirstName').equals('John').and(qodata.filter('LastName').contains('Doe').or('LastName').contains('Captain'));
        
Calling the group method

        var filter = qodata.filter('FirstName').equals('John').and(qodata.filter('LastName').contains('Doe').or('LastName').contains('Captain').group());
        
        
# Some examples


Ok! So, let's go to the ODATA.org service and make a request !

What we want is this request (copy this request to your browser address bar and see the result !) :

http://services.odata.org/V4/Northwind/Northwind.svc/Customers?$select=CompanyName,CustomerID,ContactName,Address,City,Country&$orderby=ContactName desc&$expand=Orders($select=OrderDate,ShipName;$orderby=OrderDate desc;$expand=Order_Details($expand=Product($select=ProductName,UnitPrice,UnitsInStock;$filter=UnitPrice gt 9)))&$filter=contains(ContactName,'an') or Country eq 'France'

## Example #1 : let's chain all methods !

        var query = qodata.query('http://services.odata.org/V4/Northwind/Northwind.svc');
        
        query.from('Customers')
        	.select('CompanyName,CustomerID,ContactName,Address,City,Country')
        	.orderby('ContactName').desc()
        	.where(qodata.filter('ContactName').contains('an').or('Country').equals('France'))
        	.expand(qodata.entity('Orders').select(['OrderDate', 'ShipName']).orderby('OrderDate').desc())
        	.expand('Order_Details')
        	.expand(qodata.entity('Product').select(['ProductName', 'UnitPrice', 'UnitsInStock']).where(qodata.filter('UnitPrice').greaterThan(9)));
        	
        query.toString();
        
## Example #2 : let's do the same request as above but work with objects

        var query = qodata.query('http://services.odata.org/V4/Northwind/Northwind.svc');
        
        var customers = qodata.entity('Customers')
	        .select('CompanyName, CustomerID, ContactName, Address, City, Country')
	        .orderby('ContactName').desc()
	        .where(qodata.filter('ContactName').contains('an').or('Country').equals('France'));
	
        var orders = qodata.entity('Orders')
        	.select(['OrderDate', 'ShipName'])
        	.orderby('OrderDate').desc();
    	
        var details = orders.expand(qodata.entity('Order_Details'));
    
        details.expand(
        	qodata.entity('Product')
        		.select(['ProductName', 'UnitPrice', 'UnitsInStock'])
        		.where(qodata.filter('UnitPrice').greaterThan(9))
        	);
    	
        customers.expand(orders);
    
        /*	alternative
        customers
        	.expand(qodata.entity('Orders').select(['OrderDate', 'ShipName']).orderby('OrderDate').desc())
        	.expand('Order_Details')
        	.expand(qodata.entity('Product').select(['ProductName', 'UnitPrice', 'UnitsInStock']).where(qodata.filter('UnitPrice').greaterThan(9)))
        	;
        */	
    
        query.from(customers);
    
        query.toString();
