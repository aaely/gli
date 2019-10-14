import React, { Component } from 'react';
import loadingItems from './Loader';
import { Box,
    Icon,
    SearchField,
    Heading,
    Text,
    Image,
    Mask,
    Card,
    Button,
    Container, 
    IconButton} from 'gestalt';
import { Link } from 'react-router-dom';
import Strapi from 'strapi-sdk-javascript/build/main';
import Loader from './Loader';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class Vends extends Component {
    state = {
        vendors: [],
        loadingItems: true,
        searchTerm: '',
        value: ''
    }

    async componentDidMount() {
        try {
            //console.log(this.props.match.params.itemId);
            const response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    vendors {
                    _id
                    name
                    applications {
                        name
                    }
                  }
                }`
            }
        }
        );
        console.log(response);
        this.setState({
            vendors: response.data.vendors,
            loadingItems: false
        });
        }catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    handleChange = ({ value }) => {
        this.setState({ searchTerm: value});
    };

    filteredItems = ({ searchTerm, vendors }) => {
        return vendors.filter(prop => {
            return prop.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    render() {
        let { searchTerm, loadingItems } = this.state;
        return(
            <Container>
            <Box display="flex" justifyContent="center" marginTop={4}>
                <SearchField 
                id="searchField" 
                accessibilityLabel="Items search field" 
                onChange={this.handleChange} 
                placeholder="Search Items" 
                value={searchTerm}
                />
                <Box
                margin={2}
                >
                    <Icon 
                    icon="filter"
                    color={searchTerm ? 'orange' : 'gray'}
                    size={20}
                    accessibilityLabel="Filter"
                    />
                </Box>
            </Box>
            {this.filteredItems(this.state).map(a => {
                return(
                <Box display="flex" alignItems="center">
                    <Link to={`/vendors/${a._id}`}>{a.name}</Link>     
                </Box>
               );
            })}            
            {loadingItems && <Loader />}
            </Container>
        );
    }
}

export default Vends;