import React from "react";
import red from "../img/red.png";
import green from "../img/green.png"
import { Button } from '@entur/component-library';
import { Table, Thead, Tbody, Tr, Th, Td } from "react-super-responsive-table"
import "react-super-responsive-table/dist/SuperResponsiveTableStyle.css"
import { Switch } from '@entur/form';
import { Contrast } from '@entur/layout';

class Overview extends React.Component {

    state = {
        date: '',
        showExpiredMessages: false
    };

    componentDidMount() {
        let date = new Date().getDate(); if(date < 10){ date = "0"+date }
        let month = new Date().getMonth() + 1; if(month < 10){ month = "0"+month }
        let year = new Date().getFullYear();
        let hours = new Date().getHours(); if(hours < 10){ hours = "0"+hours }
        let min = new Date().getMinutes(); if(min < 10){ min = "0"+min }
        let sec = new Date().getSeconds(); if(sec < 10){ sec = "0"+sec }

        this.setState({ date: `${year}-${month}-${date}T${hours}:${min}:${sec}+02:00`, });
    }

    handleClick = () => {
        this.props.history.push('/register');
    };

    returnRedOrGreenIcon = (param) => {
        if(Date.parse(param.ValidityPeriod.EndTime) < Date.parse(this.state.date) || param.Progress === 'closed'){
            return <img src={red} id='not_active' alt="" height="30" width="30" />
        }else {
            return <img src={green} id='active' alt="" height="30" width="30"/>
        }
    };

    getType = (param) => {
        if(param != null){
            if(Object.keys(param)[0] === "Networks"){ return "Linje" }
            if(Object.keys(param)[0] === "StopPoints"){ return "Stopp" }
            if(Object.keys(param)[0] === "VehicleJourneys"){ return "Avgang" }
            else{ return "Error" }
        }else{ return "Error" }
    };

    getDate = (param) => {
        if(param){
            var datePart = param.match(/\d+/g),
                year = datePart[0].substring(2),
                month = datePart[1], day = datePart[2],
                hour = datePart[3], minutes = datePart[4];
            return `${hour}:${minutes}  ${day}.${month}.${year}`;
        }else{
            return 'Ikke oppgitt'
        }
    };

    edit = (id) => {
        this.props.history.push(`/edit/${id}`);
    };

    render() {
        let messages = this.state.showExpiredMessages ?
            this.props.messages :
            this.props.messages.filter(({data: message}) => {
                return message.Progress === 'open' ||
                  message.ValidityPeriod.EndTime > this.state.date;
            });


        return (
            <div>
                <div className="register_box" id="overview" >
                    <h2 className="text-center text-white">Oversikt</h2>
                    <br></br>
                    <div>
                        <Button variant="secondary" onClick={this.handleClick} type="button" className="btn btn-warning btn-lg btn-block">Ny melding</Button>
                    </div>
                    <br></br>
                    <Contrast>
                        <Switch
                            checked={this.state.showExpiredMessages}
                            onChange={() => this.setState({ showExpiredMessages: !this.state.showExpiredMessages})}>
                            Vis utløpte meldinger
                        </Switch>
                    </Contrast>
                    <br></br>
                    {(messages) &&
                    <div className="table-responsive-md">
                        <Table id="dtOrderExample"
                               className="table table-striped table-light table-borderless table-hover"
                               bgcolor="#000000">
                            <Thead className="bg-primary">
                            <Tr bgcolor="#babbcf">
                                <Th scope="col"><b>Status</b></Th>
                                <Th scope="col"><b>#</b></Th>
                                <Th scope="col"><b>Oppsommering</b></Th>
                                <Th scope="col"><b>Rapporttype</b></Th>
                                <Th scope="col"><b>Fra-dato</b></Th>
                                <Th scope="col"><b>Til-dato</b></Th>
                                <Th scope="col"><b>Type</b></Th>
                                <Th scope="col"></Th>
                            </Tr>
                            </Thead>
                            <Tbody>
                            {messages.map(({id, data: item}, index) => (
                                <Tr key={item.SituationNumber}>
                                    <Td className='Status'>{this.returnRedOrGreenIcon(item)}</Td>
                                    <Td className='#'>{item.SituationNumber.split(":").pop()}</Td>
                                    <Td className='Melding' width="25%">{item.Summary['_text']}</Td>
                                    <Td className='ReportType'>{item.ReportType}</Td>
                                    <Td className='Fra-dato'>{this.getDate(item.ValidityPeriod.StartTime)}</Td>
                                    <Td className='Til-dato'>{this.getDate(item.ValidityPeriod.EndTime)}</Td>
                                    <Td className='Type'>{this.getType(item.Affects)}</Td>
                                    <Td>
                                        <Button variant="secondary" value={index}
                                                onClick={() => this.edit(id)}>Endre
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                            </Tbody>
                        </Table>
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default Overview;
