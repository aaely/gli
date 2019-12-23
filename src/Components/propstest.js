import React, { Component } from 'react';

class Test extends Component {

    render() {
        console.log(this.props);
        return(
            <div>
                <h1>The data from parent is: {this.props.submissionId} </h1>
            </div>
        );
    }
}

export default Test;