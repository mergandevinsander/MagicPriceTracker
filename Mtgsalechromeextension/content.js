rarityMap = {
	'Обычная': 'c',
	'Необычная' : 'u',
	'Редкая' : 'r',
	'Мифическая' : 'm',
}
execptions = {
	notexists : [
		{ set:'at', ids: [18, 80] },
		/* basic land with out arts */
		{ set: 'ddp', ids: [35,36,39,40,71,72] }
	],
	doubles: [
		{ set: 'chk', ids: [160] }
	],
	emptyset: [ 'etp', '4ea', 're', 'scgp']
}

function GetID(id, set) {
	for (var i = execptions.notexists.length - 1; i >= 0; i--) {
		var ne = execptions.notexists[i];
		if (ne.set == set) {
			for (var j = 0; j < ne.ids.length;j++) {
				if (id >= ne.ids[j])
					id++;
			};
		}
	};
	for (var i = execptions.doubles.length - 1; i >= 0; i--) {
		var dbl = execptions.doubles[i];
		if (dbl.set == set) {
			for (var j = 0; j < dbl.ids.length; j++) {
				if (id >= dbl.ids[j])
					id--;
			};
		}
	};
	return id;
};

function toDictionary(array, idColumn) {
	var dict = {};
	for (var i = array.length - 1; i >= 0; i--) {
		dict[array[i][idColumn]] = array[i];
	};
	return dict;
}

var sets = $('.sub').map(
	function(i, item){ 
		var id = $('.titler .seticon', item).attr('class').substring(2,$('.titler .seticon', item).attr('class').indexOf(' '));
		return {	
			id: id, 
			t: $('.titler .seticon', item).attr('title'), 
			c: toDictionary($('.ctclass',item).map(function(ii,card) { 
				return {
					id: GetID(ii + 1, id),
					sid: id,
					t: $('.tnamec',card).text().replace('"','').replace('"',''), 
					tr: $('.smallfont',card).text(), 
					r: rarityMap[$('.redkost',card).text()] || 's', 
					p: ($('.pprice',card).text().replace(/((\d+) ₽)?\s*((\d+) коп\.)?/, '$2.$4') + '0') * 1 || 0
	      		}; 
	        }).toArray(), 'id')
	    }; 
	}).toArray();

for (var i = 0; i < sets.length; i++) {
	$.ajax({
		url:'http://nodejs-mongo-persistent-magicpricetracker.193b.starter-ca-central-1.openshiftapps.com//api/cards',
		data: JSON.stringify(sets[i]),
		dataType:'json',
		method:'post'
	});
}