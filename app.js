var budgetController = (function () {

    var Expense = function (id, description, value) { // function constructor
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    // this function calculates the percentage
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome >0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){ //returns the percentage
        return this.percentage;
    };


    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // function to calculate the the total
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };


    // the data structure for the application 
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    // Adding new items
    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create an ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' and 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        // to elements from the data structure
        deleteItem :function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },



        // Function to calculate the budget
        calculateBudget: function () {

            // Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget: income - expense

            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },
        calculatePercentages :function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages:function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function () {
            console.log(data);
        }

    };


})();

var UIController = (function () {

    // to make the code more reusable and we make an object of all the input fields
    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
            // String manipulation to convert numbers to string and display them on screen

            var formatNumber = function(num, type){
                var numSplit, int, dec, type;
    
                num = Math.abs(num);
                num = num.toFixed(2); // this converts number onto decimal ex 200.00 or 100.99 and it is in string
    
                // Adding a comma in the number
            numSplit = num.split('.');
            int = numSplit[0];
                if(int.length >3){
                    int = int.substr(0, int.length-3)+ ',' + int.substr(int.length-3 ,3); 
                            }
                            dec = numSplit[1];
                            return (type === 'exp' ? '-': '+') + ' ' + int + '.' +dec;
            };

            var nodeListforEach = function(list, callback){
                for(var i=0; i<list.length; i++){
                    callback(list[i],i);
                }
            };


    return {
        getInput: function () {

            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };

        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data Use of .replace method
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem :function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el); 
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            // fields is a list and slice method will convert it to an array

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus(); // to bring focus back oin description block
        },

        displayBudget: function (obj) {
            var type;
            obj.budget >0 ? type = 'inc': type ='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent =formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }

        },
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); // this returns a node list


            nodeListforEach(fields, function(current, index){
                if(percentages[index] >0){
                    current.textContent = percentages[index]+ '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function(){
            var now , months , month, year;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        // To change the coloe of input files to red when we choose - sign
        changedType: function(){
 
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListforEach(fields, function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
 

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListener = function () {


        var DOM = UICtrl.getDOMstrings();


        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

    };
    // to upadte the budget

    var updateBudget = function () {
        // 1. Caluclate the budget
        budgetCtrl.calculateBudget();

        //2 Return the budget
        var budget = budgetCtrl.getBudget();

        // 3 Display the budget on  the ui
        UICtrl.displayBudget(budget);
        //console.log(budget);
    };
    var updatePercentages = function(){

        // 1. Calculate percentges
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        //3. Update the UI wiith the new percentages
       // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    };


    // to add items in the list or the ui
    var ctrlAddItem = function () {
        var input, newItem;
        // 1 Get the input field
        input = UICtrl.getInput();
        //  console.log(input);
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2 Add the item  to the budgetController . This method is passed in the addList() function as obj 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3 Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4 clear the fields
            UICtrl.clearFields();

            updateBudget();

            //5. Calculate and update the percentages
                updatePercentages();

        }

    };
    var ctrlDeleteItem = function(event){
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id); // for dom traversing
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            if(itemID){
                splitID = itemID.split('-');
                type = splitID[0];
                ID = parseInt(splitID[1]); // this is a string
            }
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            //4. Calculate and update the percentages
            updatePercentages();

    };

    return {
        init: function () {
            console.log("app is on mf");
            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListener();
        }
    }

})(budgetController, UIController);

controller.init();