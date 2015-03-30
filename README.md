# qodata
A simple pure JavaScript library, very deeply inspired by joData, to help you query OData V4 services
Thanx to the author of joData.

## Note
I am not a JavaScript killer, so feel free to help me make it better as in performance, bugs, ...

Feel free to fork, use, pull fixes and improvements!

Despite a lots of bugs might be present, this version is still usable.

Documentation in progress...

and here's an example:

var query = qodata.query('https://my.api.domain');

query
	.from('Employees')
	.select(['FirstName','LastName','Hired','Job'])
	.where(
		qodata.filter('LastName')
			.contains('doe')
		.and('Job')
			.equals('Manager')
		.and('Hired')
			.lessThan(5)
	)
	.orderby('LastName')
		.desc()
		
query.toString();

and the result:

https://my.api.domain/Employees?$select=FirstName,LastName,Hired,Job&$orderby=LastName desc&$filter=contains(LastName,'doe') and Job eq 'Manager' and Hired lt 5
