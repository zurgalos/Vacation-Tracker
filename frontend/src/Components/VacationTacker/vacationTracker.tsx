import React, { Component } from 'react';
import './vacationTracker.css'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadUser } from '../../Redux/actions/auth-actions-types';
import { ThunkDispatch } from 'redux-thunk';
import { AppActions } from '../../Redux/types/auth/auth-action-type';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import Global from '../../Services/config';


type Props = LinkDispatchProps;
interface AdminVacationsTrackerPageState {
  vacations: { destination: string, followers: number, vacationId: number }[]
}

class AdminVacationsPage extends Component<Props, AdminVacationsTrackerPageState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      vacations: []
    }
  }


  async componentDidMount() {
    this.props.loadUser();
    const res = await axios.get<{ destination: string, followers: number, vacationId: number }[]>(Global.serverUrl + "/api/vacations/all-vacations-followers");
    this.setState({ vacations: res.data });
  }

  render() {
    const data = {

      labels: this.state.vacations.map(v => v.destination),
      datasets: [
        {
          barThickness: 43,
          label: 'Followers',
          backgroundColor: 'blue',
          borderColor: 'blue',
          borderWidth: 1,
          hoverBackgroundColor: 'lightblue',
          hoverBorderColor: 'lightblue',
          data: this.state.vacations.map(v => v.followers),

        }
      ]
    };
    return (

      <div  className="container chart-container">
        <div className="row">
          <div className="col-sm-9 col-md-7 col-lg-5 mx-auto"></div>
          <Bar

            data={data}
            width={100}
            height={450}
            options={{

              legend: {
                labels: {
                  fontColor: "black",
                  fontSize: 18
                }
              },
              scales: {
                yAxes: [{
                  ticks: {
                    fontColor: "black",
                    fontSize: 18,
                    stepSize: 1,
                    beginAtZero: true
                  }
                }],
                xAxes: [{
                  ticks: {
                    fontColor: "black",
                    fontSize: 18,
                    stepSize: 1,
                    beginAtZero: true
                  }
                }]
              },

              title: {
                display: true,
                text: 'Followers-Tracker',
                fontSize: '30',
                fontColor: 'black'
              },
              maintainAspectRatio: false
            }}
          />
        </div>
      </div>

    )
  }
}


interface LinkDispatchProps {
  loadUser: () => void;
}
const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
  loadUser: bindActionCreators(loadUser, dispatch)
});
export default connect(
  null,
  mapDispatchToProps
)(AdminVacationsPage);




