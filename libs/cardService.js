var CardSetModel    = require('./mongoose').CardSetModel
var CardSetList     = require('./mongoose').CardSetList
var priceParser     = require('./priceParser')
var log             = require('./log')(module)

function toDictionary(array, idColumn) {
    var dict = {};
    for (var i = array.length - 1; i >= 0; i--) {
        dict[array[i][idColumn]] = array[i];
    };
    return dict;
};

module.exports = {
  getSets: (callBack) => {
  return CardSetList.find().exec( (err, cardsets) => {
      if (err) log.error('Internal error: %s', err.message)
      callBack(cardsets)
    })
  },

  getSet: (setId, callBack) => {
    return CardSetModel.findOne({ id: setId }).exec( (err, cardSet) => {
      if (err) console.error('Internal error: %s', err.message)
      callBack(cardSet)
    })
  },

  setInLib: (setId, cardId, inLib) => {
  	CardSetModel.findOne({ id: setId }).exec( (err, set) => {
      var card = set.cards.filter( (card) => { return card.id == cardId } ).pop()
      if (card) card.inLib = inLib
      set.save( (err) => { if (err) console.error('Internal error: %s',err.message) })
    })
  },

  addAndLogSet: (diff) => {
    var diff
    CardSetList.findOne({ id: diff.id }, (err, set) => {
      if(set) return 
      set = new CardSetList({ id: diff.id, title: diff.title })
      return set.save( (err) => {
       if (err) console.error('Internal error: %s',err.message)
      })
    })

    CardSetModel.findOne({ id: diff.id }, (err, set) => {
      if(!set) {
      	set = new CardSetModel(diff)
      	return set.save( (err) => { if (err) console.error('Internal error: %s',err.message) })
      } 

      var dict = toDictionary(diff.cards, 'id')
      for (var j = set.cards.length - 1; j >= 0; j--) {
      	var card = set.cards[j]
      	var newCard = dict[card.id]
      	if (newCard.price != card.price) {
      	  card.priceHistory = card.priceHistory.concat(newCard.priceHistory);
      	  card.price = newCard.price
      	}
      }

      return set.save( (err) => {
      	if (err) console.error('Internal error: %s',err.message)
      })
    })
  }


}