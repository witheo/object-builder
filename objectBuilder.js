/* eslint linebreak-style: ["error", "windows"] */
function recursiveTraverseObject(baseCase, object, current, ...nestingNames) {
    if (current) {
        const currentObjectValues = object[current] || {};
        return {
            ...object,
            [current]: { ...recursiveTraverseObject(baseCase, currentObjectValues, ...nestingNames) },
        };
    }
    return baseCase(object);
}
function recursiveRetrieveObject(object, current, ...nestingNames) {
    if (current) {
        recursiveRetrieveObject(object[current], ...nestingNames);
    }
    return { ...object };
}
function setData(data = {}) {
    function setScope(...nestingNames) {
        function getScope() {
            return [...nestingNames];
        }
        function pushScope(name) {
            return {
                ...setScope(...nestingNames, name),
            };
        }
        function popScope() {
            if (nestingNames.slice(1).length > 0) {
                return {
                    ...setScope(nestingNames.slice(1).length),
                };
            }
            return {
                ...setScope(),
            };
        }
        function addObject(object) {
            const baseCase = (newObject) => ({ ...newObject, ...object });
            const newObject = recursiveTraverseObject(baseCase, data, ...nestingNames);
            return {
                ...setData(newObject).setScope(...nestingNames),
            };
        }
        function removeObject(objectName) {
            const baseCase = (newObject) => Object.keys(newObject).reduce((accum, current) => {
                if (current === objectName) {
                    return accum;
                }
                return { ...accum, [current]: newObject[current] };
            }, {});
            const newObject = recursiveTraverseObject(baseCase, data, ...nestingNames);
            return {
                ...setData(newObject).setScope(...nestingNames),
            };
        }
        return {
            addObject,
            removeObject,
            setScope,
            popScope,
            pushScope,
            getScope,
            data,
            getCurrentObject: () => recursiveRetrieveObject(data, ...nestingNames),
        };
    }
    return { setScope };
}

const test = setData()
    .setScope()
    .addObject({ test1: 'test1' })
    .addObject({ test2: 'test2' })
    .addObject({ test3: 'test3' })
    .pushScope('nestedtest1')
    .addObject({ test4: 'test4' })
    .pushScope('nestedtest2')
    .addObject({ test5: 'test5' })
    .data;
const test2 = setData(test)
    .setScope('nestedtest1')
    .addObject({ test7: 'test7' })
    .popScope()
    .addObject({ test6: 'test6' })
    .removeObject('test6')
    .pushScope('fish')
    .addObject({ test6: 'test6' })
    .removeObject('test6')
    .popScope()
    .removeObject('fish')
    .getCurrentObject();
console.log(test);
console.log(test2);