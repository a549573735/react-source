import React, { Component } from 'react'
import RouterContext from './context';
export class HashRouter extends Component {

    state = {
        location:{pathname:window.location.hash.slice(1) || '/'}
    }

    componentDidMount() {
        window.addEventListener('hashchange', e => {
            this.setState({
                location: {
                    ...this.state.location,
                    pathname:window.location.hash.slice(1)
                }
            })
        })
        window.location.hash = window.location.hash || '/';
    }

    render() {
        let value = {
            location: this.state.location
        }
        return (
            <RouterContext.Provider value={value}>
                {
                    this.props.children
                }
            </RouterContext.Provider>
        )
    }
}

export default HashRouter
