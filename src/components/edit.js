import React from "react";
import Flatpickr from "react-flatpickr";
import { Button } from '@entur/component-library';

class Edit extends React.Component {

    state = {
        id: this.props.match.params.deviationId,
        date: '',
        dateShort: '',
    };

    componentDidMount() {
        let date = new Date().getDate(); if(date < 10){ date = "0"+date }
        let month = new Date().getMonth() + 1; if(month < 10){ month = "0"+month }
        let year = new Date().getFullYear();
        let hours = new Date().getHours(); if(hours < 10){ hours = "0"+hours }
        let min = new Date().getMinutes(); if(min < 10){ min = "0"+min }
        let sec = new Date().getSeconds(); if(sec < 10){ sec = "0"+sec }

        this.setState({
            date: year + '-' + month + '-' + date +'T' + hours + ':' + min + ':' + sec+"+02:00",
            dateShort: year + '-' + month + '-' + date +'T' + hours + ':' + min,
        });
    }

    handleSubmit = (event) => {
        this.props.data.PtSituationElement[(parseInt(this.state.id))].Progress = 'open';
        this.props.data.PtSituationElement[(parseInt(this.state.id))].Summary['_text'] = event.target.oppsummering.value;
        if(event.target.beskrivelse.value !== ''){
            this.props.data.PtSituationElement[(parseInt(this.state.id))]['Description'] = {
                _attributes: { 'xml:lang': 'NO' },
                _text: event.target.beskrivelse.value,
            }
        }else{
            if(this.props.data.PtSituationElement[(parseInt(this.state.id))].Description){
                delete this.props.data.PtSituationElement[(parseInt(this.state.id))].Description;
            }
        }
        if(event.target.forslag.value !== ''){
            this.props.data.PtSituationElement[(parseInt(this.state.id))]['Advice'] = {
                _attributes: { 'xml:lang': 'NO' },
                _text: event.target.forslag.value,
            }
        }else{
            if(this.props.data.PtSituationElement[(parseInt(this.state.id))].Advice){
                delete this.props.data.PtSituationElement[(parseInt(this.state.id))].Advice;
            }
        }
        if(event.target.from.value){
            this.props.data.PtSituationElement[(parseInt(this.state.id))].ValidityPeriod.StartTime = event.target.from.value.replace(" ", "T")+":00+02:00";
        }
        if(event.target.to.value){
            this.props.data.PtSituationElement[(parseInt(this.state.id))].ValidityPeriod.EndTime = event.target.to.value.replace(" ", "T")+":00+02:00";
        }
        this.props.data.PtSituationElement[(parseInt(this.state.id))].ReportType = event.target.reportType.value;
        this.props.firebase.collection(this.props.organization).doc('Issues').set( this.props.data );
        this.props.history.push('/');
    };

    handleClick = () => {
        this.props.history.push('/');
    };

    setProgressToClosed = () => {
        this.props.data.PtSituationElement[(parseInt(this.state.id))].Progress = 'closed';
        this.props.firebase.collection(this.props.organization).doc(this.props.docID).set( this.props.data );
        this.props.history.push('/');
    };

    checkStatus = (param) => {
        if(param === 'open'){
            return <div className="submit justify-content-center">
                <div className="form-group d-flex">
                    <Button variant="negative" width="fluid" onClick={this.setProgressToClosed} className="p-2 btn ">Deaktiver</Button>
                    <Button variant="secondary" width="fluid" type="submit" className="p-2 btn ">Endre</Button>
                </div>
                <Button variant="secondary" onClick={this.handleClick} type="submit" className="btn btn-warning btn-lg btn-block">Tilbake</Button></div>
        }else{
            return <div className="submit justify-content-center">
                <Button variant="success" className="btn btn-success btn-lg btn-block">Aktiver</Button>
                <Button variant="secondary" onClick={this.handleClick} type="submit" className="btn btn-warning btn-lg btn-block">Tilbake</Button></div>
        }
    };

    returnValue = (type) => {
        let issue = this.props.data.PtSituationElement[(parseInt(this.state.id))];

        if(type === 'ReportType'){ return issue.ReportType }
        if(type === 'summary'){ return issue.Summary['_text'] }
        if(type === 'description'){ if(issue.Description){ return issue.Description['_text'] } else { return '' } }
        if(type === 'advice'){ if(issue.Advice){ return issue.Advice['_text'] } else { return '' } }
        if(type === 'from'){ return issue.ValidityPeriod.StartTime.replace(":00+02:00", "") }
        if(type === 'to'){
            if(issue.ValidityPeriod.EndTime){
                return issue.ValidityPeriod.EndTime.replace(":00+02:00", "")
            }else{
                return 'Til-dato'
            }
        }
        return 'error'
    };

    render() {
        return (
            <div>
                <div className="register_box" id="overview" >
                    <form className="register" onSubmit={this.handleSubmit} autoComplete="off">
                        <br></br>
                        <h2 className="text-center text-white">Endre avvik</h2>
                        <br></br>
                        <div className="severity">
                            <p className="text-center text-white">Rapporttype</p>
                            <select className="form-control" id='cssmenu' defaultValue={this.returnValue("ReportType")} name="reportType">
                                <option value="general">General</option>
                                <option value="incident">Incident</option>
                            </select>
                            <br></br>
                        </div>
                        <p id="message" className="text-center text-white" >Melding</p>
                        <input type="String" name="oppsummering" className="form-control"
                               defaultValue={this.returnValue('summary')} maxLength="160"
                                required/>
                        <input type="String" name="beskrivelse" className="form-control"
                               defaultValue={this.returnValue('description')}/>
                        <input type="String" name="forslag" className="form-control"
                               defaultValue={this.returnValue('advice')}/>
                        <br></br>
                        <p className="text-center text-white">Gyldighetsdato</p>
                        <div className="form-group d-flex">
                            <Flatpickr data-enable-time
                                       value={this.returnValue('from')}
                                       name='from'
                                       className="date-form form-control"
                                       options={ {
                                           enableTime: true,
                                           dateFormat: "Y-m-d H:i",
                                           time_24hr: true}}
                            />
                            <Flatpickr onChange={this.handleChangeDate}
                                       id='date-to' data-enable-time
                                       placeholder='Til-dato'
                                       value={this.returnValue('to')}
                                       name='to'
                                       className="date-form form-control"
                                       options={ {
                                           enableTime: true,
                                           minDate: this.state.dateShort,
                                           dateFormat: "Y-m-d H:i",
                                           time_24hr: true}}
                            />
                        </div>
                        <br></br>
                        {this.checkStatus(this.props.data.PtSituationElement[(parseInt(this.state.id))].Progress)}
                    </form>
                </div>
            </div>
        );
    }
}

export default Edit;
