from sqlite3 import Time
from fastapi import HTTPException
from sqlalchemy import VARCHAR, Column, ForeignKeyConstraint, String, Integer, ForeignKey, DateTime, Numeric, Enum, Text, Boolean, Float, Date, select, Time
from app.api.spatial.models import Area
from app.api.well.models import DepthDatum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
import uuid
from app.core.enum_operations import extend_enum
from app.core.constants import uom, UnitType
from sqlalchemy.ext.hybrid import hybrid_property
from app.utils.models_utils import GUID
from app.utils.model_bases import CreateBase, EditBase, KKKSInfoBase, AreaInfoBase, FieldInfoBase
from app.api.rig.models import Rig, RigType
from app.core.ppdm_database import PPDMBase, ppdm_table,ppdm_table_pk_to_fk, table_fk_from_model
from app.core.public_database import Base

class Severity(PyEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class WellServiceJobCategory(PyEnum):
    PRESSURE_TEMPERATURE_MEASUREMENT = "Pressure & temperature measurement"
    PRODUCTION_LOGGING = "Production logging"
    ROUTINE_MAINTENANCE = "Routine maintenance"
    CHEMICAL_INJECTION = "Chemical injection"
    WELLBORE_CLEANOUT = "Wellbore cleanout"
    GAS_LIFT_VALVES = "Gas lift valves"
    SCSSV_OPENING = "SCSSV opening"
    SURFACE_EQUIPMENT_INSTALLATION_REPAIR = "Surface equipment installation and repair"
    PUMP_CHANGES_REPAIR = "Pump changes/repair"
    STRING_FISHING_REPAIR_REPLACEMENT = "String fishing and repair/replacement"
    TUBING_REPAIR_REPLACEMENT = "Tubing repair/replacement"
    ACIDIZING = "Acidizing"
    OTHERS = "Others"

class WorkoverJobCategory(PyEnum):
    ADDITIONAL_PERFORATION = "Additional perforation"
    FRACTURING = "Fracturing"
    ACIDIZING = "Acidizing"
    REMEDIAL_CEMENTING = "Remedial cementing"
    RECOMPLETION = "Recompletion"
    SAND_CONTROL = "Sand control"
    WATER_SHUT_OFF = "Water shut off"
    CHANGE_OF_LIFT_SYSTEM = "Change of lift system"
    CASING_OR_LINER_REPAIR = "Casing or liner repair"
    WELL_CONVERSION = "Well conversion"
    SSSV_SYSTEM_REPAIR = "SSSV system repair"
    FISHING = "Fishing"
    TUBING_CHANGES = "Tubing changes"
    WELLBORE_CLEANOUT = "Wellbore cleanout"
    PERFORATING = "Perforating"
    WELL_TESTING = "Well testing"
    EQUIPMENT_INSTALLATION = "Equipment installation"
    ARTIFICIAL_LIFT_INSTALLATION = "Artificial lift installation"
    PUT_ON_PRODUCTION = "Put on production"
    WELL_PERFORMANCE_ASSESSMENT = "Well performance assessment"
    OTHERS = "Others"

class ContractType(PyEnum):
    COST_RECOVERY = 'COST-RECOVERY'
    GROSS_SPLIT = 'GROSS-SPLIT'

# class JobInstanceType(PyEnum):
#     PROPOSED = 'PROPOSED'
#     APPROVED = 'APPROVED'
#     RETURNED = 'RETURNED'
#     POST_OPERATION = 'POST OPERATION'
#     PPP = 'PPP'

class HazardType(PyEnum):
    GAS_KICK = "GAS KICK"
    STUCK_PIPE = "STUCK PIPE"
    LOST_CIRCULATION = "LOST CIRCULATION"
    WELL_CONTROL = "WELL CONTROL"
    EQUIPMENT_FAILURE = "EQUIPMENT FAILURE"
    OTHER = "OTHER"

class PlanningStatus(PyEnum):
    PROPOSED = 'PROPOSED'
    APPROVED = 'APPROVED'
    RETURNED = 'RETURNED'

class OperationStatus(PyEnum):
    OPERATING = 'OPERATING'
    FINISHED = 'FINISHED'

class PPPStatus(PyEnum):
    PROPOSED = 'PROPOSED'
    APPROVED = 'APPROVED'
    RETURNED = 'RETURNED'

class CloseOutStatus(PyEnum):
    PROPOSED = 'PROPOSED'
    APPROVED = 'APPROVED'

class JobType(PyEnum):
    EXPLORATION = 'EXPLORATION'
    DEVELOPMENT = 'DEVELOPMENT'
    WORKOVER = 'WORKOVER'
    WELLSERVICE = 'WELLSERVICE'

class Job(Base, CreateBase, EditBase, KKKSInfoBase, AreaInfoBase, FieldInfoBase):
    
    __tablename__ = 'jobs'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    job_type = Column(Enum(JobType))
    
    #kkks information
    kkks_id = ppdm_table_pk_to_fk("business_associate")
    kkks = relationship('KKKS', back_populates='jobs')

    area_id = Column(VARCHAR(40))
    area_type = Column(VARCHAR(40))
    area = relationship('Area', back_populates='jobs')
    
    field_id = ppdm_table_pk_to_fk("field")
    field = relationship('Field', back_populates='jobs')
    
    #contract information
    contract_type = Column(Enum(ContractType))
    
    afe_number = Column(String(20))
    wpb_year = Column(Integer)
    
    #Planning
    job_plan_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    job_plan = relationship('JobInstance', foreign_keys=[job_plan_id], cascade="all, delete")
    
    @property
    def well_name(self):
        return self.job_plan.well.well_name if self.job_plan else None

    date_proposed = Column(Date)
    date_returned = Column(Date)
    date_approved = Column(Date)
    
    approved_by_id = Column(GUID(), ForeignKey('users.id'))
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    
    returned_by_id = Column(GUID(), ForeignKey('users.id'))
    returned_by = relationship("User", foreign_keys=[returned_by_id])
    
    planning_status = Column(Enum(PlanningStatus))
    
    #Operation
    actual_job_id = Column(GUID(), ForeignKey('job_instances.job_instance_id', ondelete="CASCADE"))
    actual_job = relationship('JobInstance', foreign_keys=[actual_job_id])
    
    daily_operations_report = relationship('DailyOperationsReport', cascade="all, delete-orphan")
    
    @hybrid_property
    def plan_start_date(self):
        return self.job_plan.start_date if self.job_plan else None
    
    @plan_start_date.expression
    def plan_start_date(cls):
        return select(JobInstance.start_date).where(cls.job_plan_id == JobInstance.job_instance_id).as_scalar()

    @hybrid_property
    def plan_total_budget(self):
        return self.job_plan.total_budget if self.job_plan else None
    
    @plan_total_budget.expression
    def plan_total_budget(cls):
        return select(JobInstance.total_budget).where(cls.job_plan_id == JobInstance.job_instance_id).as_scalar()
    
    @hybrid_property
    def plan_end_date(self):
        return self.job_plan.end_date if self.job_plan else None
    
    @plan_end_date.expression
    def plan_end_date(cls):
        return select(JobInstance.end_date).where(cls.job_plan_id == JobInstance.job_instance_id).as_scalar()

    @hybrid_property
    def actual_start_date(self):
        return self.actual_job.start_date if self.actual_job else None
    
    @actual_start_date.expression
    def actual_start_date(cls):
        return select(JobInstance.start_date).where(cls.actual_job_id == JobInstance.job_instance_id).as_scalar()

    @hybrid_property
    def actual_total_budget(self):
        return self.actual_job.total_budget if self.actual_job else None
    
    @actual_total_budget.expression
    def actual_total_budget(cls):
        return select(JobInstance.total_budget).where(cls.actual_job_id == JobInstance.job_instance_id).as_scalar()

    @hybrid_property
    def actual_end_date(self):
        return self.actual_job.end_date if self.actual_job else None
    
    @actual_end_date.expression
    def actual_end_date(cls):
        return select(JobInstance.end_date).where(cls.actual_job_id == JobInstance.job_instance_id).as_scalar()
        
    job_issues = relationship('JobIssue', back_populates='job', cascade="all, delete-orphan")
    operation_status = Column(Enum(OperationStatus))
    
    #PPP
    date_ppp_proposed = Column(Date)
    
    #syarat PPP
    surat_pengajuan_ppp_id = Column(GUID(), ForeignKey('job_documents.id'))
    nomor_surat_pengajuan_ppp = Column(String(50))
    surat_pengajuan_ppp = relationship('JobDocument', foreign_keys=[surat_pengajuan_ppp_id], cascade="all, delete")
    
    # Field for Dokumen Persetujuan AFE/WP&B
    dokumen_persetujuan_afe_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_persetujuan_afe = relationship('JobDocument', foreign_keys=[dokumen_persetujuan_afe_id], cascade="all, delete")

    # Field for Dokumen Project Summary
    dokumen_project_summary_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_project_summary = relationship('JobDocument', foreign_keys=[dokumen_project_summary_id], cascade="all, delete")

    # Field for Dokumen Pernyataan
    dokumen_pernyataan_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_pernyataan = relationship('JobDocument', foreign_keys=[dokumen_pernyataan_id], cascade="all, delete")

    # Field for Dokumen Laporan Pekerjaan
    dokumen_laporan_pekerjaan_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_laporan_pekerjaan = relationship('JobDocument', foreign_keys=[dokumen_laporan_pekerjaan_id], cascade="all, delete")

    # Field for Dokumen Formulir
    dokumen_formulir_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_formulir = relationship('JobDocument', foreign_keys=[dokumen_formulir_id], cascade="all, delete")

    # Field for Dokumen Korespondensi
    dokumen_korespondensi_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_korespondensi = relationship('JobDocument', foreign_keys=[dokumen_korespondensi_id], cascade="all, delete")

    # Field for Dokumen Sumur Tidak Berproduksi
    dokumen_sumur_tidak_berproduksi_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_sumur_tidak_berproduksi = relationship('JobDocument', foreign_keys=[dokumen_sumur_tidak_berproduksi_id], cascade="all, delete")

    # Field for Dokumen Daftar Material
    dokumen_daftar_material_id = Column(GUID(), ForeignKey('job_documents.id'))
    dokumen_daftar_material = relationship('JobDocument', foreign_keys=[dokumen_daftar_material_id], cascade="all, delete")
    
    date_ppp_approved = Column(Date)
    
    ppp_status = Column(Enum(PPPStatus))
    
    #CloseOut
    date_co_proposed = Column(Date)
    date_co_approved = Column(Date)
    
    final_budget = Column(Float)
    
    closeout_status = Column(Enum(CloseOutStatus))
    
    __table_args__ = (
        ForeignKeyConstraint(
            [area_id, area_type],
            [Area.id, Area.area_type]),
        {})

    @property
    def job_current_status(self):
        if self.closeout_status is not None:
            return f"CLOSE OUT {self.closeout_status.value}"
        elif self.ppp_status is not None:
            return f"P3 {self.ppp_status.value}"
        elif self.operation_status is not None:
            return f"OPERATION {self.operation_status.value}"
        else:
            return f"PLAN {self.planning_status.value}"
        
    def __init__(self, *args, **kwargs):
        kwargs["area_type"] = "WILAYAH KERJA"
        super().__init__(*args, **kwargs)
    
    def __init__(self, *args, **kwargs):
        self.area_type = "WILAYAH KERJA"
        super().__init__(*args, **kwargs)
    
class JobInstance(Base):
    
    __tablename__ = 'job_instances'
    
    job_instance_id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    well_id = ppdm_table_pk_to_fk("well")
    
    job_phase_type = Column(String(20))
    
    start_date = Column(Date)
    end_date = Column(Date)
    total_budget = Column(Numeric(precision=10, scale=2))
    
    rig_id = Column(VARCHAR(40))
    sf_subtype = Column(VARCHAR(30))
    rig = relationship('Rig', back_populates='jobs', uselist=False)
    
    job_operation_days = relationship('JobOperationDay', cascade="all, delete-orphan")
    
    job_hazards = relationship('JobHazard', cascade="all, delete-orphan")
    job_documents = relationship('JobDocument', cascade="all, delete-orphan")
    
    work_breakdown_structure_id = Column(GUID(), ForeignKey('job_wbs.id'))
    work_breakdown_structure = relationship('WorkBreakdownStructure', foreign_keys=[work_breakdown_structure_id], cascade="all, delete")
    
    job_project_management_team = relationship("JobProjectManagementTeam", cascade="all, delete-orphan")
    job_equipments = relationship("JobEquipment", cascade="all, delete-orphan")
    job_hse_aspect = relationship("JobHSEAspect", uselist=False, cascade="all, delete-orphan")
    
    __table_args__ = (ForeignKeyConstraint(
        [rig_id, sf_subtype],
        [Rig.id, Rig.sf_subtype]),
    {})
    
    @hybrid_property
    def rig_name(self):
        return self.rig.rig_name if self.rig else None

    @rig_name.expression
    def rig_name(cls):
        return select(Rig.rig_name).where(cls.rig_id == Rig.id).as_scalar()
    
    @hybrid_property
    def rig_type(self):
        return self.rig.rig_type if self.rig else None

    @rig_type.expression
    def rig_type(cls):
        return select(Rig.rig_type).where(cls.rig_id == Rig.id).as_scalar()
    
    @hybrid_property
    def rig_horse_power(self):
        return self.rig.rig_horse_power if self.rig else None

    @rig_horse_power.expression
    def rig_horse_power(cls):
        return select(Rig.rig_horse_power).where(cls.rig_id == Rig.id).as_scalar()
    
    @property
    def available_data(self):
        return {
            "Job Operation Days": "Available" if self.job_operation_days else "Not Available",
            "Work Breakdown Structure": "Available" if self.work_breakdown_structure else "Not Available",
            "Job Hazards": "Available" if self.job_hazards else "Not Available",
            "Job Documents": "Available" if self.job_documents else "Not Available",
            "Job Project Management Team": "Available" if self.job_project_management_team else "Not Available",
            "Job Equipments": "Available" if self.job_equipments else "Not Available",
            "Job HSE Aspect": "Available" if self.job_hse_aspect else "Not Available",
        }
    
    __mapper_args__ = {
        "polymorphic_on": "job_phase_type",
    }

class PlanExploration(JobInstance):
    
    __tablename__ = 'job_plan_exploration'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('PlanWell', foreign_keys=[JobInstance.well_id], cascade="all, delete")
    
    # rig information
    rig_name = Column(String(50))
    rig_type = Column(Enum(RigType))
    rig_horse_power = Column(Float)

    wrm_pembebasan_lahan = Column(Boolean)
    wrm_ippkh = Column(Boolean)
    wrm_ukl_upl = Column(Boolean)
    wrm_amdal = Column(Boolean)
    wrm_pengadaan_rig = Column(Boolean)
    wrm_pengadaan_drilling_services = Column(Boolean)
    wrm_pengadaan_lli = Column(Boolean)
    wrm_persiapan_lokasi = Column(Boolean)
    wrm_internal_kkks = Column(Boolean)
    wrm_evaluasi_subsurface = Column(Boolean)

    __mapper_args__ = {
        "polymorphic_identity": 'plan_exploration',
    }

class PlanDevelopment(JobInstance):
    
    __tablename__ = 'job_plan_development'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('PlanWell', foreign_keys=[JobInstance.well_id], cascade="all, delete")
   
    wrm_pembebasan_lahan = Column(Boolean)
    wrm_ippkh = Column(Boolean)
    wrm_ukl_upl = Column(Boolean)
    wrm_amdal = Column(Boolean)
    wrm_cutting_dumping = Column(Boolean)
    wrm_pengadaan_rig = Column(Boolean)
    wrm_pengadaan_drilling_services = Column(Boolean)
    wrm_pengadaan_lli = Column(Boolean)
    wrm_persiapan_lokasi = Column(Boolean)
    wrm_internal_kkks = Column(Boolean)
    wrm_evaluasi_subsurface = Column(Boolean)

    __mapper_args__ = {
        "polymorphic_identity": 'plan_development',
    }

class PlanWorkover(JobInstance):
    
    __tablename__ = 'job_plan_workover'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('ExistingWell', foreign_keys=[JobInstance.well_id], back_populates="plan_workover")
    
    equipment = Column(String(50))
    equipment_specifications = Column(Text)
    
    job_category = Column(Enum(WorkoverJobCategory))
    job_description = Column(Text)
    
    #current
    onstream_oil = Column(Float)
    onstream_gas = Column(Float)
    onstream_water_cut = Column(Float)
    
    #target
    target_oil = Column(Float)
    target_gas = Column(Float)
    target_water_cut = Column(Float)

    wrm_internal_kkks = Column(Boolean)
    wrm_pengadaan_equipment = Column(Boolean)
    wrm_pengadaan_services = Column(Boolean)
    wrm_pengadaan_handak = Column(Boolean)
    wrm_pengadaan_octg = Column(Boolean)
    wrm_pengadaan_lli = Column(Boolean)
    wrm_pengadaan_artificial_lift = Column(Boolean)
    wrm_sumur_berproduksi = Column(Boolean)
    wrm_fasilitas_produksi = Column(Boolean)
    wrm_persiapan_lokasi = Column(Boolean)
    wrm_well_integrity = Column(Boolean)

    #well schematic
    well_schematic_id = Column(GUID(), ForeignKey('job_well_schematics.id'))
    well_schematic = relationship('WellSchematic', foreign_keys=[well_schematic_id], uselist=False, cascade="all, delete")
    
    __mapper_args__ = {
        "polymorphic_identity": 'plan_workover',
    }

class PlanWellService(JobInstance):
    
    __tablename__ = 'job_plan_well_service'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('ExistingWell', foreign_keys=[JobInstance.well_id], back_populates="plan_well_service")
    
    equipment = Column(String(50))
    equipment_specifications = Column(Text)
    
    job_category = Column(Enum(WellServiceJobCategory))
    job_description = Column(Text)
    
    #current
    onstream_oil = Column(Float)
    onstream_gas = Column(Float)
    onstream_water_cut = Column(Float)
    
    #target
    target_oil = Column(Float)
    target_gas = Column(Float)
    target_water_cut = Column(Float)
    
    wrm_internal_kkks = Column(Boolean)
    wrm_pengadaan_equipment = Column(Boolean)
    wrm_pengadaan_services = Column(Boolean)
    wrm_pengadaan_handak = Column(Boolean)
    wrm_pengadaan_octg = Column(Boolean)
    wrm_pengadaan_lli = Column(Boolean)
    wrm_pengadaan_artificial_lift = Column(Boolean)
    wrm_sumur_berproduksi = Column(Boolean)
    wrm_fasilitas_produksi = Column(Boolean)
    wrm_persiapan_lokasi = Column(Boolean)
    wrm_well_integrity = Column(Boolean)

    #well schematic
    well_schematic_id = Column(GUID(), ForeignKey('job_well_schematics.id'))
    well_schematic = relationship('WellSchematic', foreign_keys=[well_schematic_id], uselist=False, cascade="all, delete")
        
    __mapper_args__ = {
        "polymorphic_identity": 'plan_wellservice',
    }

class ActualExploration(JobInstance):
    
    __tablename__ = 'job_actual_exploration'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('ActualWell', foreign_keys=[JobInstance.well_id], cascade="all, delete")

    wrm_pembebasan_lahan = Column(Integer)
    wrm_ippkh = Column(Integer)
    wrm_ukl_upl = Column(Integer)
    wrm_amdal = Column(Integer)
    wrm_pengadaan_rig = Column(Integer)
    wrm_pengadaan_drilling_services = Column(Integer)
    wrm_pengadaan_lli = Column(Integer)
    wrm_persiapan_lokasi = Column(Integer)
    wrm_internal_kkks = Column(Integer)
    wrm_evaluasi_subsurface = Column(Integer)

    __mapper_args__ = {
        "polymorphic_identity": 'actual_exploration',
    }

class ActualDevelopment(JobInstance):
    
    __tablename__ = 'job_actual_development'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    well = relationship('ActualWell', foreign_keys=[JobInstance.well_id], cascade="all, delete")
    
    wrm_pembebasan_lahan = Column(Integer)
    wrm_ippkh = Column(Integer)
    wrm_ukl_upl = Column(Integer)
    wrm_amdal = Column(Integer)
    wrm_cutting_dumping = Column(Integer)
    wrm_pengadaan_rig = Column(Integer)
    wrm_pengadaan_drilling_services = Column(Integer)
    wrm_pengadaan_lli = Column(Integer)
    wrm_persiapan_lokasi = Column(Integer)
    wrm_internal_kkks = Column(Integer)
    wrm_evaluasi_subsurface = Column(Integer)

    __mapper_args__ = {
        "polymorphic_identity": 'actual_development',
    }

class ActualWorkover(JobInstance):
    
    __tablename__ = 'job_actual_workover'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('ExistingWell', foreign_keys=[JobInstance.well_id], back_populates="actual_workover")
    
    equipment = Column(String(50))
    equipment_specifications = Column(Text)
    
    job_category = Column(Enum(WorkoverJobCategory))
    job_description = Column(Text)
    
    #target
    onstream_oil = Column(Float)
    onstream_gas = Column(Float)
    onstream_water_cut = Column(Float)
    
    wrm_internal_kkks = Column(Integer)
    wrm_pengadaan_equipment = Column(Integer)
    wrm_pengadaan_services = Column(Integer)
    wrm_pengadaan_handak = Column(Integer)
    wrm_pengadaan_octg = Column(Integer)
    wrm_pengadaan_lli = Column(Integer)
    wrm_pengadaan_artificial_lift = Column(Integer)
    wrm_sumur_berproduksi = Column(Integer)
    wrm_fasilitas_produksi = Column(Integer)
    wrm_persiapan_lokasi = Column(Integer)
    wrm_well_integrity = Column(Integer)
    
    #well schematic
    well_schematic_id = Column(GUID(), ForeignKey('job_well_schematics.id'))
    well_schematic = relationship('WellSchematic', foreign_keys=[well_schematic_id], uselist=False, cascade="all, delete")
    
    # #completion string
    # completion_id = Column(GUID(), ForeignKey('job_workover_completion_actuals.id'))
    # completion = relationship('ActualWorkoverCompletion', foreign_keys=[completion_id])
    
    __mapper_args__ = {
        "polymorphic_identity": 'actual_workover',
    }

class ActualWellService(JobInstance):
    
    __tablename__ = 'job_actual_well_service'
    
    id = Column(GUID(), ForeignKey('job_instances.job_instance_id'), primary_key=True)
    
    well = relationship('ExistingWell', foreign_keys=[JobInstance.well_id], back_populates="actual_well_service")
    
    equipment = Column(String(50))
    equipment_specifications = Column(Text)
    
    job_category = Column(Enum(WellServiceJobCategory))
    job_description = Column(Text)
    
    onstream_oil = Column(Float)
    onstream_gas = Column(Float)
    onstream_water_cut = Column(Float)
    
    wrm_internal_kkks = Column(Integer)
    wrm_pengadaan_equipment = Column(Integer)
    wrm_pengadaan_services = Column(Integer)
    wrm_pengadaan_handak = Column(Integer)
    wrm_pengadaan_octg = Column(Integer)
    wrm_pengadaan_lli = Column(Integer)
    wrm_pengadaan_artificial_lift = Column(Integer)
    wrm_sumur_berproduksi = Column(Integer)
    wrm_fasilitas_produksi = Column(Integer)
    wrm_persiapan_lokasi = Column(Integer)
    wrm_well_integrity = Column(Integer)
    
    #well schematic
    well_schematic_id = Column(GUID(), ForeignKey('job_well_schematics.id'))
    well_schematic = relationship('WellSchematic', foreign_keys=[well_schematic_id], uselist=False, cascade="all, delete")
    
    __mapper_args__ = {
        "polymorphic_identity": 'actual_wellservice',
    }
    

class WBSWRMEvent(Base):
    
    __tablename__ = 'job_wrm_wbs'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    event_type = Column(String(12))
    start_date = Column(Date)
    end_date = Column(Date)
    remarks = Column(Text)
    
    __mapper_args__ = {
        'polymorphic_identity': 'event',
        'polymorphic_on': event_type
    }

class WBSCustomEvent(Base):
    
    __tablename__ = 'job_wbs_events'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    start_date = Column(Date)
    end_date = Column(Date)
    remarks = Column(Text)
    
    work_breakdown_structure_id = Column(GUID(), ForeignKey('job_wbs.id'))

    event = Column(String(255))

class WorkBreakdownStructure(Base):
    
    __tablename__ = 'job_wbs'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    # job_instance = relationship('JobInstance', back_populates='work_breakdown_structure', single_parent=True)
    
    wbs_type = Column(String(4))
    
    events = relationship('WBSCustomEvent', cascade="all, delete-orphan")

    wrm_internal_kkks_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_internal_kkks = relationship('WBSWRMEvent', foreign_keys=[wrm_internal_kkks_id], cascade="all, delete")

    wrm_persiapan_lokasi_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_persiapan_lokasi = relationship('WBSWRMEvent', foreign_keys=[wrm_persiapan_lokasi_id], cascade="all, delete")

    wrm_pengadaan_lli_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_lli = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_lli_id], cascade="all, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'wrm_event',
        'polymorphic_on': wbs_type
    }

# class WBSCustomEventRelationship(Base):
#     __tablename__ = 'job_wrm_wbs_r'
    
#     wbs_id = Column(GUID(), ForeignKey('job_wbs.id'), primary_key=True)
#     event_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'), primary_key=True)

class WorkBreakdownStructureDrilling(WorkBreakdownStructure):
    
    wrm_pembebasan_lahan_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pembebasan_lahan = relationship('WBSWRMEvent', foreign_keys=[wrm_pembebasan_lahan_id], cascade="all, delete")
    
    wrm_ippkh_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_ippkh = relationship('WBSWRMEvent', foreign_keys=[wrm_ippkh_id], cascade="all, delete")
    
    wrm_ukl_upl_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_ukl_upl = relationship('WBSWRMEvent', foreign_keys=[wrm_ukl_upl_id], cascade="all, delete")
    
    wrm_amdal_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_amdal = relationship('WBSWRMEvent', foreign_keys=[wrm_amdal_id], cascade="all, delete")
    
    wrm_pengadaan_rig_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_rig = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_rig_id], cascade="all, delete")
    
    wrm_pengadaan_drilling_services_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_drilling_services = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_drilling_services_id], cascade="all, delete")
    
    wrm_evaluasi_subsurface_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_evaluasi_subsurface = relationship('WBSWRMEvent', foreign_keys=[wrm_evaluasi_subsurface_id], cascade="all, delete")
    
    wrm_cutting_dumping_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_cutting_dumping = relationship('WBSWRMEvent', foreign_keys=[wrm_cutting_dumping_id], cascade="all, delete")

    __mapper_args__ = {
        'polymorphic_identity': 'drl',
    }

class WorkBreakdownStructureWOWS(WorkBreakdownStructure):
    
    wrm_pengadaan_equipment_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_equipment = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_equipment_id], cascade="all, delete")
    
    wrm_pengadaan_services_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_services = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_services_id], cascade="all, delete")
    
    wrm_pengadaan_handak_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_handak = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_handak_id], cascade="all, delete")
    
    wrm_pengadaan_octg_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_octg = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_octg_id], cascade="all, delete")
    
    wrm_pengadaan_artificial_lift_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_pengadaan_artificial_lift = relationship('WBSWRMEvent', foreign_keys=[wrm_pengadaan_artificial_lift_id], cascade="all, delete")
    
    wrm_sumur_berproduksi_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_sumur_berproduksi = relationship('WBSWRMEvent', foreign_keys=[wrm_sumur_berproduksi_id], cascade="all, delete")
    
    wrm_fasilitas_produksi_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_fasilitas_produksi = relationship('WBSWRMEvent', foreign_keys=[wrm_fasilitas_produksi_id], cascade="all, delete")
    
    wrm_well_integrity_id = Column(GUID(), ForeignKey('job_wrm_wbs.id'))
    wrm_well_integrity = relationship('WBSWRMEvent', foreign_keys=[wrm_well_integrity_id], cascade="all, delete")
    
    __mapper_args__ = {
        'polymorphic_identity': 'wows',
    }

class JobHazard(Base):
    
    __tablename__ = 'job_hazards'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    # job_instance = relationship('JobInstance', back_populates='job_hazards')
    
    hazard_type = Column(Enum(HazardType))
    hazard_description = Column(Text)
    severity = Column(Enum(Severity))
    mitigation = Column(Text)
    
    remark = Column(Text)

class JobDocumentType(PyEnum):
    DRILLING_PLAN = "Drilling Plan"
    COMPLETION_PLAN = "Completion Plan"
    WELL_DESIGN = "Well Design"
    MUD_PLAN = "Mud Plan"
    CEMENTING_PLAN = "Cementing Plan"
    WELL_TRAJECTORY_PLAN = "Well Trajectory Plan"
    RISK_ASSESSMENT_PLAN = "Risk Assessment Plan"
    SAFETY_PLAN = "Safety Plan"
    ENVIRONMENTAL_PLAN = "Environmental Plan"
    LOGGING_PLAN = "Logging Plan"
    PORE_PRESSURE_PREDICTION = "Pore Pressure Prediction"
    HYDRAULICS_PLAN = "Hydraulics Plan"
    CASING_PLAN = "Casing Plan"
    CONTINGENCY_PLAN = "Contingency Plan"
    SURAT_TAJAK = "Surat Tajak"
    PPP = "Dokumen Kelengkapan PPP"
    PPP_OTHER = "Dokumen Lainnya PPP"
    CO_OTHER = "Dokumen Lainnya Close Out"

class JobDocument(Base):
    
    __tablename__ = 'job_documents'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    # job_instance = relationship('JobInstance', back_populates='job_documents')

    file_id = Column(GUID(), ForeignKey('files.id'))
    file = relationship('FileRecord', foreign_keys=[file_id])
    
    @property
    def filename(self):
        return self.file.filename
    @filename.setter
    def filename(self, value):
        pass
    
    document_type = Column(Enum(JobDocumentType))
    
    remark = Column(Text)
    
class JobOperationDay(Base):
    __tablename__ = 'job_operation_days'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    unit_type = Column(Enum(UnitType))

    phase = Column(String(50))
    
    depth_datum = Column(Enum(DepthDatum))
    
    depth_in = Column(Float)
    depth_out = Column(Float)
    depth_uom = Column(String(5))  # Changed to String
    
    operation_days = Column(Float)
    
    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    # job_instance = relationship('JobInstance', back_populates='job_operation_days')

    def __init__(self, unit_type, *args, **kwargs):

        uom_map = uom.get(unit_type, {})
        self.depth_uom = uom_map.get('Length', 'm')  # Default to meters if not found
        self.unit_type = unit_type

        super().__init__(*args, **kwargs)

class JobIssue(Base):
    
    __tablename__ = 'job_issues'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    job_id = Column(GUID(), ForeignKey('jobs.id'))
    job = relationship('Job', back_populates='job_issues')
    
    date_time = Column(DateTime)
    severity = Column(Enum(Severity))
    description = Column(Text)
    
    resolved = Column(Boolean, default=False)
    resolved_date_time = Column(DateTime)

class YesNo(PyEnum):
    Y = 'Y'
    N = 'N'

class JobProjectManagementTeam(Base):
    
    __tablename__ = 'job_project_management_teams'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    company = Column(String(50))
    position = Column(String(50))
    name = Column(String(50))
    
    email = Column(String(50))
    contact = Column(String(50))
    
    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))

class JobEquipment(Base):
    
    __tablename__ = 'job_equipments'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    # job_instance = relationship('JobInstance', back_populates='job_equipments')
    
    equipment = Column(String(50))
    vendor = Column(String(50))

class JobHSEAspect(Base):

    __tablename__ = 'job_hse_aspects'

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)

    job_instance_id = Column(GUID(), ForeignKey('job_instances.job_instance_id'))
    # job_instance = relationship('JobInstance', back_populates='job_hse_aspects')

    near_miss = Column(Integer)
    fatality = Column(Integer)
    spill = Column(Integer)
    unsafe_condition = Column(Integer)
    unsafe_action = Column(Integer)
    man_hour = Column(Integer)

class DailyOperationsReport(Base):
    
    __allow_recursive__ = False
    
    __tablename__ = 'job_daily_operations_reports'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    job_id = Column(GUID(), ForeignKey('jobs.id'))
    # job = relationship('Job', back_populates='daily_operations_report')
    
    #date
    report_date = Column(Date)
    
    contractor = Column(String(255))
    current_md = Column(Float)
    
    #drilling parameters
    avg_wob = Column(Float)
    avg_rop = Column(Float)	
    avg_rpm = Column(Float)	
    torque = Column(Float)	
    stand_pipe_pressure = Column(Float)	
    flow_rate = Column(Float)	
    string_weight = Column(Float)	
    rotating_weight = Column(Float)	
    total_drilling_time = Column(Float)	
    circulating_pressure = Column(Float)	
    
    #afe
    daily_cost = Column(Float)
    daily_mud_cost = Column(Float)
    
    #human resource
    day_supervisor = Column(String)
    night_supervisor =Column(String)
    engineer = Column(String)
    geologist = Column(String)
    
    day_summary = Column(Text)
    day_forecast = Column(Text)
    
    #casing
    last_size = Column(Float)
    set_md = Column(Float)
    next_size = Column(Float)
    next_set_md = Column(Float)
    last_lot_emw = Column(Float)
    tol = Column(Float)
    
    #mud volumes
    start_mud_volume = Column(Float)
    lost_surface_mud_volume = Column(Float)
    lost_dh_mud_volume = Column(Float)
    dumped_mud_volume = Column(Float)
    built_mud_volume = Column(Float)
    ending_mud_volume = Column(Float)
    
    #gas
    max_gas = Column(Float)
    conn_gas = Column(Float)
    trip_gas = Column(Float)
    back_gas = Column(Float)

    #hydraulic analysis
    annular_velocity = Column(Float)
    pb = Column(Float)
    sys_hhp = Column(Float)
    hhpb = Column(Float)
    hsi = Column(Float)
    percent_psib = Column(Float)
    jet_velocity = Column(Float)
    impact_force = Column(Float)
    if_area = Column(Float)
    
    #hse
    stop_cards = Column(Integer)
    lta = Column(Enum(YesNo))
    spill = Column(Enum(YesNo))
    h2s_test = Column(Enum(YesNo))
    hse_mtg = Column(Enum(YesNo))
    kicktrip = Column(Enum(YesNo))
    kickdrill = Column(Enum(YesNo))
    fire = Column(Enum(YesNo))
    
    #lampiran
    time_breakdowns = relationship("TimeBreakdown", cascade="all, delete-orphan")
    bit_records = relationship('BitRecord', cascade="all, delete-orphan")
    bottom_hole_assemblies = relationship('BottomHoleAssembly', cascade="all, delete-orphan")
    drilling_fluids = relationship('DrillingFluid', cascade="all, delete-orphan")
    mud_additives = relationship('MudAdditive', cascade="all, delete-orphan")
    bulk_materials = relationship('BulkMaterial', cascade="all, delete-orphan")
    incidents = relationship("Incident", cascade="all, delete-orphan")
    personnel = relationship("Personnel", cascade="all, delete-orphan")
    directional_surveys = relationship('DirectionalSurvey', cascade="all, delete-orphan")
    pumps = relationship('Pumps', cascade="all, delete-orphan")
    weather = relationship('Weather', uselist=False, cascade="all, delete-orphan")

class JobCategory(PyEnum):
    DRILLING = 'DRILLING'
    COMPLETION = 'COMPLETION'
    WORKOVER = 'WORKOVER'

class NPT(PyEnum):
    NP = 'NP'
    P = 'P'

class DrillingOperation(PyEnum):
    RIG_UP_TEAR_DOWN = "(1) Rig Up and Tear Down"
    DRILL_ACTUAL = "(2) Drill Actual"
    REAMING = "(3) Reaming"
    CORING = "(4) Coring"
    CONDITION_MUD_CIRCULATE = "(5) Condition Mud & Circulate"
    TRIPS = "(6) Trips"
    LUBRICATE_RIG = "(7) Lubricate Rig"
    REPAIR_RIG = "(8) Repair Rig"
    CUT_OFF_DRILLING_LINE = "(9) Cut Off Drilling Line"
    DEVIATION_SURVEY = "(10) Deviation Survey"
    WIRE_LINE_LOGS = "(11) Wire Line Logs"
    RUN_CASING_CEMENT = "(12) Run Casing & Cement"
    WAIT_ON_CEMENT = "(13) Wait On Cement"
    NIPPLE_UP_BOP = "(14) Nipple Up B.O.P."
    TEST_BOP = "(15) Test B.O.P."
    DRILL_STEM_TEST = "(16) Drill Stem Test"
    PLUG_BACK = "(17) Plug Back"
    SQUEEZE_CEMENT = "(18) Squeeze Cement"
    FISHING = "(19) Fishing"
    DIR_WORK = "(20) Dir. Work"
    RUN_RETRIEVE_RISER_EQUIP = "(21) Run/Retrieve Riser Equip."
    SURFACE_TESTING = "(22) Surface Testing"
    OTHER = "(23) Other"

class CompletionOperation(PyEnum):
    PERFORATING = "(A) Perforating"
    TUBING_TRIPS = "(B) Tubing Trips"
    TREATING = "(C) Treating"
    SWABBING = "(D) Swabbing"
    TESTING = "(E) Testing"

class WorkoverOperation(PyEnum):
    SAND_CONTROL = "(c) Sand Control"
    WATER_SHUT_OFF = "(d) Water Shut Off"
    WELLBORE_CLEANOUT = "(e) Wellbore Cleanout"
    STANDBY = "(n) Standby"
    MOBILIZATION = "(o) Mobilization"
    OTHER = "(p) Other"

@extend_enum([DrillingOperation,CompletionOperation, WorkoverOperation])
class OperationCode(PyEnum):
   pass

class TimeBreakdown(Base):
    
    __tablename__ = 'job_time_breakdown'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship("DailyOperationsReport", back_populates="time_breakdowns")
    
    #time
    start_time = Column(Time)
    end_time = Column(Time)
    
    #measured depth
    start_measured_depth = Column(Float)
    end_measured_depth = Column(Float)
    
    #task
    category = Column(Enum(JobCategory))
    p = Column(Enum(YesNo))
    npt = Column(Enum(NPT))
    code = Column(Enum(OperationCode))
    
    operation = Column(Text)
    code = Column(Enum(OperationCode, name='operationcode', create_constraint=False))

    @property
    def start_time_without_microseconds(self):
        return self.start_time.replace(microsecond=0) if self.start_time else None

    @property
    def end_time_without_microseconds(self):
        return self.end_time.replace(microsecond=0) if self.end_time else None

class BitRecord(Base):
    
    __tablename__ = 'job_bit_records'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='bit_records')

    bit_number = Column(String(10))
    bit_size = Column(Float)
    bit_run = Column(Integer)
    manufacturer = Column(String(50))
    iadc_code = Column(String(50))
    jets = Column(String(50))
    serial = Column(String(50))
    depth_out = Column(Float)
    depth_in = Column(Float)
    meterage = Column(Float)
    bit_hours = Column(Float)
    nozzels = Column(Float)
    dull_grade = Column(String(50))

class BottomHoleAssembly(Base):
    __tablename__ = 'job_bottom_hole_assemblies'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='bottom_hole_assemblies')
    
    bha_number = Column(String(50))
    bha_run = Column(Integer)
    
    components = relationship('BHAComponent', cascade="all, delete-orphan")

class BHAComponentType(PyEnum):
    BUMPER_SUB = "Bumper Sub"
    CROSSOVER = "Crossover"
    DRILL_COLLAR = "Drill Collar"
    DRILL_PIPE = "Drill Pipe"
    FLEX_JOINT_COLLAR = "Flex Joint Collar"
    FLOAT_SUB = "Float Sub"
    HEAVY_WEIGHT_DRILL_PIPE = "Heavy Weight Drill Pipe (HWDP)"
    HOLE_OPENER = "Hole Opener"
    JAR = "Jar"
    JARS_BOOSTER = "Jars - Booster"
    JARS_HYDRAULIC = "Jars - Hydraulic"
    JARS_HYDRO_MECHANICAL = "Jars - Hydro Mechanical"
    JARS_MECHANICAL = "Jars - Mechanical"
    JUNK_SUB = "Junk Sub"
    KELLY_DOWN = "Kelly Down"
    MOTOR = "Motor"
    MWD_LWD = "MWD/LWD"
    NON_MAGNETIC_ANTENNA_SUB = "Non-Magnetic antenna sub"
    NON_MAGNETIC_COLLAR = "Non-Magnetic Collar"
    NON_MAGNETIC_INDEX_SUB = "Non-Magnetic Index Sub"
    NON_MAGNETIC_INTEGRAL_BLADE_STABILIZER = "Non-Magnetic Integral Blade Stabilizer"
    NON_MAGNETIC_PONY_COLLAR = "Non-Magnetic Pony Collar"
    NON_MAGNETIC_REPEATER_SUB = "Non-Magnetic Repeater sub"
    PORTED_FV = "Ported FV"
    REAMER = "Reamer"
    ROLLER_REAMER = "RollerReamer"
    ROTARY_STEERABLE = "Rotary Steerable"
    SAFETY_JOINT = "Safety Joint"
    SAVER_SUB = "Saver Sub"
    SENSOR = "Sensor"
    SHOCK_SUB = "Shock Sub"
    SHORT_COLLAR = "Short Collar"
    SINGLES_DRILL_PIPE = "Singles Drill Pipe"
    SPERRY_DRILL = "Sperry Drill"
    SPIRAL_COLLAR = "Spiral Collar"
    STABILIZER = "Stabilizer"
    STABILIZER_VARIABLE_GAUGE = "Stabilizer - Variable Gauge"
    STABILIZER_WELDED_BLADE = "Stabilizer - Welded Blade"
    STANDS_DRILL_PIPE = "Stands Drill Pipe"
    SUB_TOTCO = "Sub totco"

class BHAComponent(Base):
    
    __tablename__ = 'job_bottom_hole_assemblies_components'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    bottom_hole_assembly_id = Column(GUID(), ForeignKey('job_bottom_hole_assemblies.id'))
    # bottom_hole_assembly = relationship('BottomHoleAssembly', back_populates='components')
    
    component = Column(Enum(BHAComponentType))
    
    outer_diameter = Column(Float)
    length = Column(Float)

class MudType(PyEnum):
    LIQUID = 'LIQUID'
    DRY = 'DRY'

class DrillingFluid(Base):
    
    __tablename__ = 'job_drilling_fluids'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
     
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='drilling_fluids')
    
    mud_type = Column(Enum(MudType))
    time = Column(Time)
    mw_in = Column(Float)
    mw_out = Column(Float)
    temp_in = Column(Float)
    temp_out = Column(Float)
    pres_grad = Column(Float)
    visc = Column(Float)
    pv = Column(Float)
    yp = Column(Float)
    gels_10_sec = Column(Float)
    gels_10_min = Column(Float)
    fluid_loss = Column(Float)
    ph = Column(Float)
    solids = Column(Float)
    sand = Column(Float)
    water = Column(Float)
    oil = Column(Float)
    hgs = Column(Float)
    lgs = Column(Float)
    ltlp = Column(Float)
    hthp = Column(Float)
    cake = Column(Float)
    e_stb = Column(Float)
    pf = Column(Float)
    mf = Column(Float)
    pm = Column(Float)
    ecd = Column(Float)

class MudAdditive(Base):
    
    __tablename__ = 'job_mud_additives'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='mud_additives')
    
    mud_additive_type = Column(String(50))
    amount = Column(Float)
    
class BulkMaterial(Base):
    
    __tablename__ = 'job_bulk_materials'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='bulk_materials')
    
    material_type = Column(String(50))
    material_name = Column(String(50))	
    material_uom = Column(String(50))
    received = Column(Float)
    consumed = Column(Float)
    returned = Column(Float)
    adjust = Column(Float)
    ending = Column(Float)

class Incident(Base):
    
    __tablename__ = 'job_hse_incidents'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)

    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='Incidents')
    
    incidents_time = Column(Time)
    incident = Column(String(50))
    incident_type = Column(String(50))
    comments = Column(Text)

class DirectionalSurvey(Base):
    
    __tablename__ = 'job_directional_surveys'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='directional_surveys')
    
    measured_depth = Column(Float)
    inclination = Column(Float)
    azimuth = Column(Float)

class Personnel(Base):
    
    __tablename__ = 'job_personnel'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='personnel')
    
    company = Column(String(50))
    people = Column(Integer)

class Pumps(Base):
    
    __tablename__ = 'job_pumps'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='pumps')
    
    slow_speed = Column(Enum(YesNo))
    circulate = Column(Float)
    strokes = Column(Float)
    pressure = Column(Float)
    liner_size = Column(Float)
    efficiency = Column(Float)

class Weather(Base):
    
    __tablename__ = 'job_weather'
    
    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    
    daily_operations_report_id = Column(GUID(), ForeignKey('job_daily_operations_reports.id'))
    # daily_operations_report = relationship('DailyOperationsReport', back_populates='weather')
    
    temperature_high = Column(Float)
    temperature_low = Column(Float)
    chill_factor = Column(Float)
    wind_speed = Column(Float)
    wind_direction = Column(Float)
    barometric_pressure = Column(Float)
    wave_height = Column(Float)
    wave_current_speed = Column(Float)
    road_condition = Column(String(50))
    visibility = Column(String(50))