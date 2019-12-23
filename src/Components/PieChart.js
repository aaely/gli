import React, { Component } from 'react';
import { Cell, Sector, Pie, PieChart } from 'recharts';
import Strapi from 'strapi-sdk-javascript/build/main';
const apiUrl = process.env.API_URL || 'http://localhost:1337';
const strapi = new Strapi(apiUrl);

let renderActiveShape = (props) => {
    let RADIAN = Math.PI / 180;
    let { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent } = props;
    let sin = Math.sin(-RADIAN * midAngle);
    let cos = Math.cos(-RADIAN * midAngle);
    let sx = cx + (outerRadius + 10) * cos;
    let sy = cy + (outerRadius + 10) * sin;
    let mx = cx + (outerRadius + 30) * cos;
    let my = cy + (outerRadius + 30) * sin;
    let ex = mx + (cos >= 0 ? 1 : -1) * 22;
    let ey = my;
    let textAnchor = cos >= 0 ? 'start' : 'end';
  
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none"/>
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none"/>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
          {`${payload.value}`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

class MyPieChart extends Component {

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
                      mods {
                          _id
                          status
                      }
                  }
                }`
            }
        }
        );
        this.setState({
            loadingItems: false,
            auditModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('audit'.toLowerCase())
            }).length,
            testableModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('testable'.toLowerCase())
            }).length,
            completeModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('complete'.toLowerCase())
            }).length,
            jiraModsCount: response.data.submission.mods.filter(prop => {
                return prop.status.toLowerCase().includes('jira'.toLowerCase())
            }).length,
            revokedModsCount: response.data.submission.mods.filter(prop => {
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
        let { auditModsCount, completeModsCount, jiraModsCount, testableModsCount, revokedModsCount, activeIndex } = this.state;
        let completeMods = completeModsCount + revokedModsCount;
        let data = [
            { name: 'Complete Mods', value: parseInt(`${completeMods}`) },
            { name: 'JIRA Mods', value: parseInt(`${jiraModsCount}`) },
            { name: 'Audit Mods', value: parseInt(`${auditModsCount}`) },
            { name: 'Testable Mods', value: parseInt(`${testableModsCount}`) },
          ];
        let COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        return(
            <PieChart width={400} height={400} style={{margin: '0 auto'}}>
                    <Pie
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={data}
                        cx={200}
                        cy={200}
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        onMouseEnter={this.onPieEnter}
                        nameKey="name"
                        paddingAngle={5}
                        isAnimationActive={true}
                        >
                            {
                            data.map((entry, index) => (
                                <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]}/>
                            ))
                            }
                    </Pie>
                </PieChart>
        );
    }
}

export default MyPieChart;