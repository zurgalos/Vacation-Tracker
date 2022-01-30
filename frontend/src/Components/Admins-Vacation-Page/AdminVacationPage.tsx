import React, { Component } from 'react';
import "./AdminsVacationPage.css"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { loadUser, stopRefreshPage } from '../../Redux/actions/auth-actions-types';
import { ThunkDispatch } from 'redux-thunk';
import { AppActions } from '../../Redux/types/auth/auth-action-type';
import { VacationModel } from '../../Models/vacationModel';
import axios from 'axios';
import Global from "../../Services/config"
import setAuthToken from '../../utills/setAuthToken';
import { popUpAlert } from '../../Redux/actions/alert-actions';
import { Alert } from '../../Redux/types/alert/alert-type';
import { Auth } from '../../Redux/types/auth/auth-type';
import { AppState } from '../../Redux/store/store';
import Modal from '../Modal/Modal';

type Props = LinkDispatchProps & LinkStateProps;
interface AdminVacationPageState {
  allVacations: VacationModel[];
  isModalOpen: boolean;
  vacationIdToEdit: number
}

class AdminVacationPage extends Component<Props, AdminVacationPageState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      allVacations: [],
      isModalOpen: false,
      vacationIdToEdit: 0
    }
  }

  async componentDidMount() {
    try {
      this.props.loadUser();
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      const res = await axios.get<VacationModel[]>(Global.serverUrl + "/api/vacations");
      const allVacations = res.data;
      this.setState({ allVacations })
      this.setState({ vacationIdToEdit: allVacations[0].vacationId });
    } catch (error) {
      console.log(error)
    }
  }

  componentDidUpdate(prevProps: { auth: { refreshPage: boolean; }; }, prevState: any) {
    if (prevProps.auth.refreshPage !== this.props.auth.refreshPage) {
      if (this.props.auth.refreshPage) {
        this.componentDidMount();
        this.props.stopRefreshPage();
      }
    }
  }

  private async deleteVacation(vacationId: number) {
    try {
      const newVac = this.state.allVacations.filter(vac => vac.vacationId !== vacationId);
      this.setState({ allVacations: newVac })
      await axios.delete(Global.serverUrl + "/api/vacations/delete/" + vacationId);
      this.props.popUpAlert({ alertType: "success", msg: "Vacation has been removed!", timeout: 5000 })
    } catch (error) {
      this.props.popUpAlert({ alertType: "danger", msg: "Failed to remove vacation!", timeout: 5000 })
    }
  }

  render() {
    return (
      this.state.allVacations.length > 0 &&
      <div className="container">
        <br /><br />
        <div className="row">
            {this.state.allVacations.map((vacation, index) => {
              return (
                <div key={vacation.vacationId} className="col-sm-12 col-md-6 col-lg-4">
                  <div className="card">
                    <div onClick={() => {
                      this.setState({ vacationIdToEdit: vacation.vacationId, isModalOpen: true })
                    }} title="Edit Vacation" className="btn btn-primary">Edit <i className="far fa-edit"></i></div>
                    <div onClick={() => {
                      this.deleteVacation(vacation.vacationId)
                    }} title="Delete Vacation" className="btn btn-danger">Delete <i className="fas fa-trash-alt"></i></div>
                    <img className="card-img-top" src={vacation.imageFileName} alt="" />
                    <div className="card-body">
                      <h5 className="card-title"><strong>Destination:</strong> {vacation.destination}</h5>
                      <p className="card-text card-text-description"><strong>Description:</strong>  {vacation.description}</p>
                      <p className="card-text"><strong>Start Of The Trip Date:</strong> {new Date(vacation.startVacationDate).toLocaleDateString()}</p>
                      <p className="card-text"><strong>End Of The Trip Date: </strong>{new Date(vacation.endVacationDate).toLocaleDateString()}</p>

                      <p className="card-text"><strong>Price: </strong> ${vacation.price}</p>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
        {this.state.vacationIdToEdit !== 0 && this.state.isModalOpen &&
          <Modal showModal={this.state.isModalOpen} closeModal={() => { this.setState({ isModalOpen: false }) }} vacationId={this.state.vacationIdToEdit}  ></Modal>
        }
      </div>
    )
  }
}


interface LinkStateProps {
  auth: Auth;
}

const mapStateToProps = (
  state: AppState,
): LinkStateProps => ({
  auth: state.auth,
});
interface LinkDispatchProps {
  popUpAlert: (alert: Alert) => void;
  loadUser: () => void;
  stopRefreshPage: () => void
}

const mapDispatchToProps = (
  dispatch: ThunkDispatch<any, any, AppActions>
): LinkDispatchProps => ({
  popUpAlert: bindActionCreators(popUpAlert, dispatch),
  loadUser: bindActionCreators(loadUser, dispatch),
  stopRefreshPage: bindActionCreators(stopRefreshPage, dispatch)
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminVacationPage);
