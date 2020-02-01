import React, { Component } from 'react';
import { Cell, Sector, Pie, RadialBarChart, Legend, RadialBar, LabelList, Tooltip, PolarAngleAxis } from 'recharts';
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

class MyRadialBarChart extends Component {

    constructor(props) {
        super(props);
        this.state = {
            auditModsCount: 0,
            modsCount: 0,
            testableModsCount: 0,
            completeModsCount: 0,
            jiraModsCount: 0,
            revokedModsCount: 0,
            activeIndex: 0
        };
    }

    async componentDidMount() {
        try {
            let response = await strapi.request('POST', '/graphql', {
            data: {
                query: `query {
                    submission (id : "${this.props.submissionId}") {
                      versions {
                          _id
                          version
                          mods {
                              _id
                              status
                          }
                      }
                  }
                }`
            }
        }
        );
        let getMods = response.data.submission.versions.map(a => {return a.mods});
        let ModsList = [];
        for (let i = 0; i < getMods.length; i++) {
            let j = 0;
            while (j < getMods[i].length) {
                ModsList.push(getMods[i][j]);
                j++;
            }
        }
        this.setState({
            loadingItems: false,
            modsCount: ModsList.length,
            auditModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('audit'.toLowerCase())
            }).length,
            testableModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('testable'.toLowerCase())
            }).length,
            completeModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('complete'.toLowerCase())
            }).length,
            jiraModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('jira'.toLowerCase())
            }).length,
            revokedModsCount: ModsList.filter(prop => {
                return prop.status.toLowerCase().includes('revoked'.toLowerCase())
            }).length
        });
        console.log(this.state);
        } catch (err) {
            console.log(err);
            this.setState({ loadingItems: false });
        }
    }

    onPieEnter = (data, index) => {
        this.setState({
            activeIndex: index,
        });
    }

    render() {
        let { modsCount, auditModsCount, completeModsCount, jiraModsCount, testableModsCount, revokedModsCount, activeIndex } = this.state;
        let completeMods = completeModsCount + revokedModsCount;
        let data = [
            { name: 'Complete Mods', uv: parseInt(`${completeMods}`) },
            { name: 'JIRA Mods', uv: parseInt(`${jiraModsCount}`) },
            { name: 'Audit Mods', uv: parseInt(`${auditModsCount}`) },
            { name: 'Testable Mods', uv: parseInt(`${testableModsCount}`) },
          ];
        let domain = [0,modsCount];
        console.log(modsCount);
        console.log(domain);
        let COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        let style = {
            lineHeight: '24px',
            left: 300,
          };
        return(
            <div className="radial-bar-chart-wrapper">
          <RadialBarChart
            width={500}
            height={300}
            cx={150}
            cy={150}
            innerRadius={20}
            outerRadius={140}
            barSize={10}
            data={data}
            style={{margin: '0 auto'}}
          >
            <PolarAngleAxis type="number" domain={domain} angleAxisId={2} tick={false} cx={150} cy={150} />
            <RadialBar minPointSize={15} background angleAxisId={2} dataKey="uv">
              {
                data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                ))
              }
              <LabelList position="insideEnd" fill="#fff" fontSize={10} />
            </RadialBar>
            <br />
            <Legend iconSize={10} width={120} height={140} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
            <Tooltip/>
          </RadialBarChart>
        </div>
        );
    }
}

export default MyRadialBarChart;