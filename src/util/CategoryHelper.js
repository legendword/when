const { textColor } = require("./color");

class CategoryHelper {

    static defaultCategoryColor = '#1976D2';

    constructor(categories) {
        this.categoryColor = {};
        this.categoryName = {};
        for (let i of categories) {
            this.categoryColor[i.id] = i.color;
            this.categoryName[i.id] = i.name;
        }
    }

    calendarItemStyle(item) {
        let a = item.category == null ? CategoryHelper.defaultCategoryColor : this.categoryColor[item.category], b = textColor(a);
        if (item.type == 'event') {
            return {
                backgroundColor: a,
                color: b
            };
        }
        else if (item.type == 'todo') {
            return {
                color: a
            };
        }
        else { // deadline
            return {
                borderLeft: `3px solid ${a}`
            };
        }
    }

    itemBackgroundStyle(item) {
        let a = item.category == null ? CategoryHelper.defaultCategoryColor : this.categoryColor[item.category], b = textColor(a);
        return {
            backgroundColor: a,
            color: b
        };
    }

    itemTextStyle(item) {
        return {
            color: item.category == null ? CategoryHelper.defaultCategoryColor : this.categoryColor[item.category]
        };
    }
}
export default CategoryHelper;