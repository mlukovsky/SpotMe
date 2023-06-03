
//MATCHMAKING ALGORITHM
//ASSIGN RANKINGS TO FACTORS:
// 1. GOES TO GYM WITHIN X MILE RADIUS OF USER
// 2. HOW MANY PASSIONS IN COMMON OR PASSIONS IN THE SAME GROUP
// 3. WITHIN CERTAIN AGE RANGE OF USER
// SEARCH DATABASE AND GIVE OTHER USERS POINTS BASED ON THESE RANKINGS
//OTHER USERS ARE ASSIGNED PRIORITY BASED ON HOW MANY POINTS THEY HAVE AND ADDED TO THE QUEUE ACCORDINGLY

class QElement {
    constructor(element, priority) {
        //THE ELEMENT IS THE USER OBJECT
        this.element = element;
        this.priority = priority
    }
}


class PriorityQueue {
    constructor() {
        this.items = [];
    }

    //add element to the queue based on its priority
    enqueue(element, priority) {
        //qElement is the element to be inserted
        const qElement = new QElement(element, priority);
        let contains = false;
        //iterate through array
        //insert element in index before the element with the smallest priority greather than the priority of qElement
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority <= qElement.priority) {
                this.items.splice(i, 0, qElement);
                contains = true;
                break;
            }
        }
        //if qElement's priority is higher than those of all elements in the array, append it to the end of the queue.
        if (!contains) {
            this.items.push(qElement)
        }
    }

    //returns element at front of queue, i.e. the element with the highest priority
    front() {
        if (this.isEmpty()) return "Queue is empty"
        return this.items[0]
    }

    //returns element at end of queue, i.e. the element with the lowest priority
    rear() {
        if (this.isEmpty()) return "Queue is empty"
        return this.items[this.items.length - 1]
    }

    //print first n elements of queue
    print(n) {
        return this.items.slice(0, n);
    }

    //check if queue is empty
    isEmpty() {
        return this.items.length === 0;
    }
}


exports.PriorityQueue = PriorityQueue
