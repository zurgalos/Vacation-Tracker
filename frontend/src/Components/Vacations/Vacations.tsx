import React, { Component } from 'react';
import io from 'socket.io-client';
import "./Vacations.css";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadUser } from '../../Redux/actions/auth-actions-types';
import { ThunkDispatch } from 'redux-thunk';
import { AppActions } from '../../Redux/types/auth/auth-action-type';
import { VacationModel } from '../../Models/vacationModel';
import axios from 'axios';
import Global from '../../Services/config';
import setAuthToken from '../../utills/setAuthToken';
import { popUpAlert } from '../../Redux/actions/alert-actions';
import { Alert } from '../../Redux/types/alert/alert-type';
import { Auth } from '../../Redux/types/auth/auth-type';
import { AppState } from '../../Redux/store/store';
import { Redirect } from 'react-router-dom';


type Props = LinkDispatchProps & LinkStateProps;

interface VacationPageState {
  allVacations: VacationModel[];
  currentUserFollowedVacations: VacationModel[];
  currentUserUnFollowedVacations: VacationModel[];
}

class VacationPage extends Component<Props, VacationPageState> {
  private socket = io.connect(Global.serverUrl); // Server 
  constructor(props: Props) {
    super(props);
    this.state = {
      allVacations: [],
      currentUserFollowedVacations: [],
      currentUserUnFollowedVacations: []
    }
    if (this.socket === null) {
      this.socket = io(Global.serverUrl);
    }
    this.socket.on("admin-change", (vacations: VacationModel[], isAdmin: number, msg: string) => {
      this.setState({ allVacations: vacations });
      if (this.props.auth.user.isAdmin !== 1 || isAdmin !== 1) {
        this.props.popUpAlert({ alertType: "success", msg: msg, timeout: 5000 })
      }
    });
  }

  componentDidMount = async () => {
    try {
      this.props.loadUser();
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      const res = await axios.get<VacationModel[]>(Global.serverUrl + "/api/vacations");
      let allVacations = res.data;
      this.setState({ allVacations })
      const res2 = await axios.get<VacationModel[]>(Global.serverUrl + "/api/vacations/my-vacations");
      
      const currentUserFollowedVacations = res2.data;
      currentUserFollowedVacations.forEach(vacation => {
        return allVacations.forEach(vacation2 => {
          return vacation.vacationId === vacation2.vacationId ? vacation.totalFollowers = vacation2.totalFollowers : vacation.totalFollowers
        })
      })
      this.setState({ currentUserFollowedVacations })
      const currentUserUnFollowedVacations = this.compareFollowedVacationsAndUnFollowedVacations();
      this.setState({ currentUserUnFollowedVacations })
    } catch (error) {
      if (error.response.data.msg === "no token, auth denied") {
        this.props.popUpAlert({ alertType: "danger", msg: "You must login before entering vacation page!", timeout: 5000 })
      }
    }
  }
  async componentDidUpdate(prevProps: Props, prevState: VacationPageState) {
    if (prevState.allVacations !== this.state.allVacations) {
      try {
        const res2 = await axios.get<VacationModel[]>(Global.serverUrl + "/api/vacations/my-vacations");
        const currentUserFollowedVacations = res2.data;
        currentUserFollowedVacations.forEach(vacation => {
          return this.state.allVacations.forEach(vacation2 => {
            return vacation.vacationId === vacation2.vacationId ? vacation.totalFollowers = vacation2.totalFollowers : vacation.totalFollowers
          })
        })
        this.setState({ currentUserFollowedVacations })
        const currentUserUnFollowedVacations = this.compareFollowedVacationsAndUnFollowedVacations();
        this.setState({ currentUserUnFollowedVacations })

      } catch (error) {
        console.log(error.response.data.msg)
      }
    }
  }


  private compareFollowedVacationsAndUnFollowedVacations() {
    function comparer(otherArray: VacationModel[]) {
      return function (current: VacationModel) {
        return otherArray.filter(function (other) {
          return other.vacationId === current.vacationId
        }).length === 0;
      }
    }
    var onlyInFollowedVacations = this.state.allVacations.filter(comparer(this.state.currentUserFollowedVacations));
    var onlyInDefaultVacations = this.state.currentUserFollowedVacations.filter(comparer(this.state.allVacations));
    const unFollowedVacations = onlyInFollowedVacations.concat(onlyInDefaultVacations);
    return unFollowedVacations
  }

  private addFollowerToVacation = async (vacationId: number) => {
    try {
      await axios.post(Global.serverUrl + "/api/vacations/add-vacation-follower", { vacationId: +vacationId });
      this.props.popUpAlert({ alertType: "success", msg: "You are now following this vacation", timeout: 5000 })
      this.componentDidMount()
    } catch (error) {
      this.props.popUpAlert({ alertType: "danger", msg: "Failed to follow that specific vacation", timeout: 5000 })
    }
  }
  private removeFollowerFromVacation = async (vacationId: number) => {
    try {
      await axios.delete(Global.serverUrl + "/api/vacations/remove-vacation-follower/" + vacationId);
      this.props.popUpAlert({ alertType: "success", msg: "You are no longer following this vacation", timeout: 5000 })
      this.componentDidMount()
    } catch (error) {
      this.props.popUpAlert({ alertType: "danger", msg: "Failed to stop following this vacation", timeout: 5000 })
    }
  }



  render() {
    if (this.props.auth.isAuthenticated && this.props.auth.user.isAdmin === 1) {
      return <Redirect to="/admin-vacations"></Redirect>
    }
    return (
      this.state.allVacations.length > 0 &&
      <div className="container">

        <br /><br />
        <div className="row">
          {this.state.currentUserFollowedVacations.length > 0 &&
            this.state.currentUserFollowedVacations.map((followedVacation, index) => {
              return (
                <div key={followedVacation.vacationId} className="col-sm-12 col-md-6 col-lg-4">
                  <div className="card ">
                    <div onClick={() => {
                      this.removeFollowerFromVacation(followedVacation.vacationId)
                    }} title="Unfollow Vacation" className="btn btn-danger">Unfollow vacation <i className="fas fa-minus-circle"></i></div>
                    <img src={followedVacation.imageFileName} className="card-img-top" alt="" />
                    <div className="card-body">
                      <h5 className="card-title"><strong>Destination:</strong> {followedVacation.destination}</h5>
                      <p className="card-text card-text-description "><strong>Description:</strong>  {followedVacation.description}</p>
                      <p className="card-text"><strong>Start Of The Trip Date:</strong> {new Date(followedVacation.startVacationDate).toLocaleDateString()}</p>
                      <p className="card-text"><strong>End Of The Trip Date: </strong>{new Date(followedVacation.endVacationDate).toLocaleDateString()}</p>
                      <p className="card-text"><strong>Price: </strong> ${followedVacation.price}</p>
                      <br />
                      <div className="followersdiv"><span title="Total-Followers">{followedVacation.totalFollowers} people are following this vaction.</span></div>
                    </div>
                  </div>
                </div>

              )
            })
          }
          {this.state.currentUserUnFollowedVacations.length > 0 &&
            this.state.currentUserUnFollowedVacations.map(unFollowedVacation => {
              return (
                <div key={unFollowedVacation.vacationId} className="col-sm-12 col-md-6 col-lg-4">
                  <div className="card">
                    <div onClick={() => { this.addFollowerToVacation(unFollowedVacation.vacationId) }} title="Follow Vacation" className="btn btn-primary">Follow Vacation </div>

                    <img className="card-img-top" src={unFollowedVacation.imageFileName} alt="" />
                    <div className="card-body">
                      <h5 className="card-title"><strong>Destination:</strong> {unFollowedVacation.destination}</h5>
                      <p className="card-text card-text-description"><strong>Description: </strong>  {unFollowedVacation.description}</p>
                      <p className="card-text"><strong>Start Of The Trip Date: </strong> {new Date(unFollowedVacation.startVacationDate).toLocaleDateString()}</p>
                      <p className="card-text"><strong>End Of The Trip Date: </strong>{new Date(unFollowedVacation.endVacationDate).toLocaleDateString()}</p>

                      <p className="card-text"><strong>Price: </strong> ${unFollowedVacation.price}</p>
                      <br />
                      <div className="followersdiv"><span title="Total Followers">{unFollowedVacation.totalFollowers} people are following this vaction.</span></div>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>

      </div>
    )
  }
}


interface LinkStateProps {
  auth: Auth
}

const mapStateToProps = (
  state: AppState,
): LinkStateProps => ({
  auth: state.auth
});
interface LinkDispatchProps {
  popUpAlert: (alert: Alert) => void;
  loadUser: () => void;
}
const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
  popUpAlert: bindActionCreators(popUpAlert, dispatch),
  loadUser: bindActionCreators(loadUser, dispatch)
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VacationPage);
