import React from 'react';
import logo from '../img/entur_logo.jpg';
import Select from 'react-select';

class NavBar extends React.Component {
  handleChange = event => {
    this.props.onSelectOrganization(event.value);
    this.props.history.push('/');
  };

  returnOptions = () => {
    let selectValues = [];
    for (let i = 0; i < this.props.user.length; i++) {
      selectValues.push({
        label: this.props.name[i],
        value: this.props.user[i]
      });
    }
    return selectValues;
  };

  render() {
    return (
      <nav className="navBar">
        <div className="padding">
          <a href="/">
            <img src={logo} width={126} height={54} alt="Entur" />
          </a>
          <div className="select-organization">
            <Select
              placeholder={this.props.name[0]}
              onChange={this.handleChange}
              options={this.returnOptions()}
            />
          </div>
          <div className="logout">
            <a href={this.props.logout}>
              <h6 className="text-center text-white">LOGG UT</h6>
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

export default NavBar;
