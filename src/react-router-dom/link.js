import React, { Component } from 'react'


export class Link extends Component {
    render() {
        return (
            <a href={`#${this.props.to}`} >{this.props.children}</a>
        )
    }
}

export default Link
