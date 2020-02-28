import React from "react";
import Flatpickr from "react-flatpickr";
import { Button } from '@entur/component-library';
import format from 'date-fns/format';
import addHours from 'date-fns/addHours';

class Edit extends React.Component {

    state = {
        id: this.props.match.params.id,
        date: '',
        dateShort: '',
    };

    componentDidMount() {
        const now = new Date();
        this.setState({
            date: format(now, `yyyy-MM-dd'T'HH:mm:ss+02:00`),
            dateShort: format(now, `yyyy-MM-dd'T'HH:mm`)
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.props.issue.data.Progress = 'open';
        this.props.issue.data.Summary['_text'] = event.target.oppsummering.value;
        if(event.target.beskrivelse.value !== ''){
            this.props.issue.data['Description'] = {
                _attributes: { 'xml:lang': 'NO' },
                _text: event.target.beskrivelse.value,
            }
        }else{
            if(this.props.issue.data.Description){
                delete this.props.issue.data.Description;
            }
        }
        if(event.target.forslag.value !== ''){
            this.props.issue.data['Advice'] = {
                _attributes: { 'xml:lang': 'NO' },
                _text: event.target.forslag.value,
            }
        }else{
            if(this.props.issue.data.Advice){
                delete this.props.issue.data.Advice;
            }
        }
        if(event.target.from.value){
            this.props.issue.data.ValidityPeriod.StartTime = event.target.from.value.replace(" ", "T")+":00+02:00";
        }
        if(event.target.to.value){
            this.props.issue.data.ValidityPeriod.EndTime = event.target.to.value.replace(" ", "T")+":00+02:00";
        }
        this.props.issue.data.ReportType = event.target.reportType.value;

        const codespace = this.props.organization.split(':')[0];
        const authority = this.props.organization;
        const id = this.props.issue.id;

        this.props.firebase
            .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
            .set(this.props.issue.data)
            .then(() => this.props.history.push('/'));
    };

    handleClick = () => {
        this.props.history.push('/');
    };

    setProgressToClosed = () => {
        const update = {
            Progress: 'closed',
            ValidityPeriod: {
                EndTime: format(addHours(new Date(), 5), `yyyy-MM-dd'T'HH:mm:ss+02:00`)
            }
        };
        const codespace = this.props.organization.split(':')[0];
        const authority = this.props.organization;
        const id = this.props.issue.id;
        this.props.firebase
            .doc(`codespaces/${codespace}/authorities/${authority}/messages/${id}`)
            .set(update, {
                mergeFields: [
                    'Progress',
                    'ValidityPeriod.EndTime'
                ]
            })
            .then(() => this.props.history.push('/'));
    };

    checkStatus = (param) => {
        if(param === 'open'){
            return <div className="submit justify-content-center">
                <div className="form-group d-flex">
                    <Button variant="negative" width="fluid" type="button" onClick={this.setProgressToClosed} className="p-2 btn ">Deaktiver</Button>
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
        let issue = this.props.issue.data;

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
                <div className="register_box">
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
                        <p className="text-center text-white" >Melding</p>
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
                        {this.checkStatus(this.props.issue.data.Progress)}
                    </form>
                </div>
            </div>
        );
    }
}

export default Edit;
